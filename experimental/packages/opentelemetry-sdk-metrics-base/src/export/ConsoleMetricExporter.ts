import { ExportResult, ExportResultCode } from "@opentelemetry/core"
import { InstrumentType } from "../InstrumentDescriptor"
import { AggregationTemporality } from "./AggregationTemporality"
import { ResourceMetrics, DataPointType } from "./MetricData"
import { PushMetricExporter } from "./MetricExporter"

export class ConsoleMetricExporter implements PushMetricExporter {
  protected _shutdown = false

  export(metrics: ResourceMetrics, resultCallback: (result: ExportResult) => void): void {
    return ConsoleMetricExporter._sendMetrics(metrics, resultCallback)
  }

  async forceFlush() {}

  selectAggregationTemporality(_instrumentType: InstrumentType): AggregationTemporality {
    return AggregationTemporality.CUMULATIVE
  }

  shutdown(): Promise<void> {
    this._shutdown = true
    return Promise.resolve()
  }

  private static _sendMetrics(metrics: ResourceMetrics, done: (result: ExportResult) => void): void {
    for (const libraryMetrics of metrics.scopeMetrics) {
      for (const metric of libraryMetrics.metrics) {
        console.dir(metric.descriptor)
        console.dir(DataPointType[metric.dataPointType])
        for (const dataPoint of metric.dataPoints) {
          console.dir(dataPoint)
        }
      }
    }
    done({ code: ExportResultCode.SUCCESS })
  }
}
