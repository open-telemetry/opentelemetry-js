import * as types from '@opentelemetry/types';
import { NodeTracer } from './NodeTracer';
import { NodeTracerConfig } from './config'

export class NodeTracerFactory implements types.TracerFactory{
  private readonly _defaultTracer: NodeTracer;

  constructor(config?: NodeTracerConfig) {
    this._defaultTracer = new NodeTracer(config);
  }

  getTracer(name?: string, version?: string) {
    return this._defaultTracer;
  }
}
