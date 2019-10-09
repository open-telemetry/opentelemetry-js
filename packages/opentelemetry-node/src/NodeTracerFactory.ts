import { NodeTracer } from './NodeTracer';

export class NodeTracerFactory implements types.TracerFactory{
  protected readonly _defaultTracer: NodeTracer
  constructor(config: NodeTracerConfig) {
    this._defaultTracer = new NodeTracer(config);
  }

  /**
   * getTracer ignores the name and version, always returning a default
   * {@link NodeTracer}.
   */
  getTracer(name?: string, version?: string) {
    return this._defaultTracer;
  }
}
