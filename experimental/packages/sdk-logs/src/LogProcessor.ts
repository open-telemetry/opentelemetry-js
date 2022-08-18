import { LogData } from "./export/LogData";

export interface LogProcessor {
  emit(data: LogData): void;

  shutdown(): Promise<void>;

  forceFlush(): Promise<void>;
}
