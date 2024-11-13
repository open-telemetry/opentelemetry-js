import { Entity } from "./IResource";
import { Detector } from "./types";

type ResourceProviderConfig {
    entityDetectors: EntityDetector[];
}

interface EntityDetector {
    detect(): Entity;
}

export class ResourceProvider {
    private _detectors: Array<EntityDetector | Detector>;

    constructor(config: Partial<ResourceProviderConfig> = {}) {
        this._detectors = config.entityDetectors ? [...config.entityDetectors] : [];
    }

    public detect() {
        for (const detector of this._detectors) {
            const res = detector.detect();
        }
    }
}