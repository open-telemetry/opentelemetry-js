import { Entity } from './entity';

/*
 * The Entity detector in the SDK is responsible for detecting possible entities that could identify
 * the SDK (called "associated entities"). For Example, if the SDK is running in a kubernetes pod,
 * it may provide an Entity for that pod.
 */
export interface EntityDetector {
  /**
   * Discovers {@link Entity} and their current attributes.
   *
   * @return a list of discovered entities.
   */
  detectEntities(): Entity[];
}
