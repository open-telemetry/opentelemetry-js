import { Attributes, AttributeValue, diag } from '@opentelemetry/api';
import { IDetectedEntity } from './types';
import { isPromiseLike } from './utils';

export interface EntityRef {
  type: string;
  identifyingAttributeKeys: string[];
  descriptiveAttributeKeys: string[];
}

export class Entity {
  private _type: string;
  private _schema_url?: string;
  private _identifier: Attributes;
  private _asyncAttributesPending = false;
  private _rawAttributes: [string, AttributeValue | Promise<AttributeValue>][];
  private _memoizedAttributes?: Attributes;

  constructor(entity: IDetectedEntity) {
    this._type = entity.type;
    this._schema_url = entity.schema_url;
    this._identifier = entity.identifier;

    if (entity.attributes) {
      this._rawAttributes = Object.entries(entity.attributes).map(([k, v]) => {
        if (isPromiseLike(v)) {
          // side-effect
          this._asyncAttributesPending = true;

          return [
            k,
            v.then(
              v => v,
              err => {
                diag.debug(
                  "a resource's async attributes promise rejected: %s",
                  err
                );
                return [k, undefined];
              }
            ),
          ];
        }

        return [k, v];
      });
    } else {
      this._rawAttributes = [];
    }
  }

  get type() {
    return this._type;
  }

  get schema_url() {
    return this._schema_url;
  }

  get identifier() {
    return this._identifier;
  }

  get asyncAttributesPending() {
    return this._asyncAttributesPending;
  }

  public async waitForAsyncAttributes(): Promise<void> {
    if (!this._asyncAttributesPending) {
      return;
    }
    this._rawAttributes = await Promise.all(
      this._rawAttributes.map<Promise<[string, AttributeValue]>>(
        async ([k, v]) => [k, await v]
      )
    );
    this._asyncAttributesPending = false;
  }

  public get attributes(): Attributes {
    if (this.asyncAttributesPending) {
      diag.error(
        'Accessing resource attributes before async attributes settled'
      );
    }

    if (this._memoizedAttributes) {
      return this._memoizedAttributes;
    }

    const attrs: Attributes = {};
    for (const [k, v] of this._rawAttributes) {
      if (isPromiseLike(v)) {
        diag.debug(`Unsettled resource attribute ${k} skipped`);
        continue;
      }
      attrs[k] ??= v;
    }

    // only memoize output if all attributes are settled
    if (!this._asyncAttributesPending) {
      this._memoizedAttributes = attrs;
    }

    return attrs;
  }
}

/**
 * Merge detected entities. Entities are assumed to be in priority order (highest first).
 */
export function mergeEntities(...entities: Entity[]): Entity[] {
  // Construct a set of detected entities, E
  const entityMap: Record<string, Entity> = {};

  // For each entity detector D, detect entities (already done)

  // For each entity detected, d'
  for (const entity of entities) {
    // If an entity e' exists in E with same entity type as d', do one of the following:
    const prevEntity = entityMap[entity.type];
    if (prevEntity != null) {
      // If the entity identity is different: drop the new entity d'.
      if (!attrsEqual(prevEntity.identifier, entity.identifier)) {
        continue;
      }

      // If the entity identity is the same, but schema_url is different: drop the new entity d' Note: We could offer configuration in this case
      if (entity.schema_url !== prevEntity.schema_url) {
        continue;
      }

      // If the entity identiy and schema_url are the same, merge the descriptive attributes of d' into e':
      // For each descriptive attribute da' in d'
      for (const [k, v] of Object.entries(entity.attributes)) {
        // If da'.key does not exist in e', then add da' to ei
        if (prevEntity.attributes[k] != null) {
          prevEntity.attributes[k] = v;
        }

        // otherwise, ignore
      }
    }
  }

  return [...Object.values(entityMap)];
}

function attrsEqual(obj1: Attributes, obj2: Attributes) {
  if (Object.keys(obj1).length != Object.keys(obj2).length) {
    return false;
  }

  for (const [k, v] of Object.entries(obj1)) {
    const v2 = obj2[k];

    if (Array.isArray(v)) {
      if (!Array.isArray(v2) || v.length !== v2.length) {
        return false;
      }

      // arrays can only contain primitives, so simple equality checks are sufficient
      for (let i = 0; i < v.length; i++) {
        if (v[i] !== v2[i]) {
          return false;
        }
      }
    } else if (v !== v2) {
      return false;
    }
  }

  return true;
}
