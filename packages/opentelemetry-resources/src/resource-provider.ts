import { Resource } from './Resource';

/**
 * A Registry which provides the {@link Resource} to the SDK.
 * 
 * Note: this does not do much initially, but eventually will be extended for resource mutation over time.
 * */
export class ResourceProvider {
  private _resource: Resource;

  constructor(resource: Resource) {
    this._resource = resource;
  }

  /**
   * Provides the currently discovered {@link Resource}.
   *
   * @return the Resource.
   */
  getResource(): Resource {
    return this._resource;
  }
}
