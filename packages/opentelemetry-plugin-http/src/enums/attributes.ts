/**
 * Attributes Names according to Opencensus HTTP Specs since there is no specific OpenTelemetry Attributes
 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/work_in_progress/opencensus/HTTP.md#attributes
 */
export enum Attributes {
  ATTRIBUTE_HTTP_HOST = 'http.host',
  // NOT ON OFFICIAL SPEC
  ATTRIBUTE_ERROR = 'error',
  ATTRIBUTE_HTTP_METHOD = 'http.method',
  ATTRIBUTE_HTTP_PATH = 'http.path',
  ATTRIBUTE_HTTP_ROUTE = 'http.route',
  ATTRIBUTE_HTTP_USER_AGENT = 'http.user_agent',
  ATTRIBUTE_HTTP_STATUS_CODE = 'http.status_code',
  // NOT ON OFFICIAL SPEC
  ATTRIBUTE_HTTP_ERROR_NAME = 'http.error_name',
  ATTRIBUTE_HTTP_ERROR_MESSAGE = 'http.error_message'
}
