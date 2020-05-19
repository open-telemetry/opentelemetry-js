import {
  CollectorExporterBase,
  CollectorExporterConfigBase
} from "../../CollectorExporterBase";
import { ReadableSpan } from "@opentelemetry/tracing";
import { toCollectorExportTraceServiceRequest } from "../../transform";
import * as collectorTypes from "../../types";

export interface CollectorExporterConfig extends CollectorExporterConfigBase {}

/**
 * Collector Exporter
 */
export class CollectorExporter extends CollectorExporterBase<
  CollectorExporterConfig
> {
  onInit(): void {
    window.addEventListener("unload", this.shutdown);
  }

  onShutdown(): void {
    window.removeEventListener("unload", this.shutdown);
  }

  sendSpans(
    spans: ReadableSpan[],
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ) {
    const exportTraceServiceRequest = toCollectorExportTraceServiceRequest(
      spans,
      this
    );

    const body = JSON.stringify(exportTraceServiceRequest);

    if (typeof navigator.sendBeacon === "function") {
      this.sendSpansWithBeacon(body, onSuccess, onError);
    } else {
      this.sendSpansWithXhr(body, onSuccess, onError);
    }
  }

  /**
   * send spans using browser navigator.sendBeacon
   * @param body
   * @param onSuccess
   * @param onError
   */
  private sendSpansWithBeacon(
    body: string,
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ) {
    if (navigator.sendBeacon(this.url, body)) {
      this.logger.debug("sendBeacon - can send", body);
      onSuccess();
    } else {
      this.logger.error("sendBeacon - cannot send", body);
      onError({});
    }
  }

  /**
   * function to send spans using browser XMLHttpRequest
   *     used when navigator.sendBeacon is not available
   * @param body
   * @param onSuccess
   * @param onError
   * @param logger
   * @param collectorUrl
   */
  private sendSpansWithXhr(
    body: string,
    onSuccess: () => void,
    onError: (error: collectorTypes.CollectorExporterError) => void
  ) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", this.url);
    xhr.setRequestHeader(collectorTypes.OT_REQUEST_HEADER, "1");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(body);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status <= 299) {
          this.logger.debug("xhr success", body);
          onSuccess();
        } else {
          this.logger.error("body", body);
          this.logger.error("xhr error", xhr);
          onError({
            code: xhr.status,
            message: xhr.responseText
          });
        }
      }
    };
  }
}
