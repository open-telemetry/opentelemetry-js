/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is auto-generated for OpenTelemetry Configuration Schema
// DO NOT EDIT MANUALLY - run npm run generate:config to regenerate

// To parse this data:
//
//   import { Convert, OpentelemetryConfiguration } from "./file";
//
//   const opentelemetryConfiguration = Convert.toOpentelemetryConfiguration(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface OpentelemetryConfiguration {
    attribute_limits?:              AttributeLimits;
    disabled?:                      boolean | null;
    file_format:                    string;
    "instrumentation/development"?: InstrumentationDevelopment;
    log_level?:                     null | string;
    logger_provider?:               LoggerProviderClass;
    meter_provider?:                MeterProviderClass;
    propagator?:                    PropagatorObject;
    resource?:                      ResourceClass;
    tracer_provider?:               TracerProviderClass;
    [property: string]: any;
}

export interface AttributeLimits {
    attribute_count_limit?:        number | null;
    attribute_value_length_limit?: number | null;
    [property: string]: any;
}

export interface InstrumentationDevelopment {
    cpp?:     { [key: string]: any };
    dotnet?:  { [key: string]: any };
    erlang?:  { [key: string]: any };
    general?: General;
    go?:      { [key: string]: any };
    java?:    { [key: string]: any };
    js?:      { [key: string]: any };
    php?:     { [key: string]: any };
    python?:  { [key: string]: any };
    ruby?:    { [key: string]: any };
    rust?:    { [key: string]: any };
    swift?:   { [key: string]: any };
}

export interface General {
    http?: HTTP;
    peer?: Peer;
}

export interface HTTP {
    client?: Client;
    server?: Server;
}

export interface Client {
    request_captured_headers?:  string[];
    response_captured_headers?: string[];
}

export interface Server {
    request_captured_headers?:  string[];
    response_captured_headers?: string[];
}

export interface Peer {
    service_mapping?: ServiceMapping[];
}

export interface ServiceMapping {
    peer:    string;
    service: string;
}

export interface LoggerProviderClass {
    limits?:                            LoggerProviderLimits;
    "logger_configurator/development"?: Logger;
    processors:                         ProcessorElement[];
}

export interface LoggerProviderLimits {
    attribute_count_limit?:        number | null;
    attribute_value_length_limit?: number | null;
}

export interface Logger {
    default_config?: LoggerConfiguratorDevelopmentDefaultConfig;
    loggers?:        LoggerElement[];
}

export interface LoggerConfiguratorDevelopmentDefaultConfig {
    disabled?: boolean;
}

export interface LoggerElement {
    config?: LoggerConfiguratorDevelopmentDefaultConfig;
    name?:   string;
}

export interface ProcessorElement {
    batch?:  PurpleBatch;
    simple?: PurpleSimple;
    [property: string]: any;
}

export interface PurpleBatch {
    export_timeout?:        number | null;
    exporter:               PurpleExporter;
    max_export_batch_size?: number | null;
    max_queue_size?:        number | null;
    schedule_delay?:        number | null;
}

export interface PurpleExporter {
    console?:                 ConsoleClass | null;
    "otlp_file/development"?: OtlpFileDevelopmentClass | null;
    otlp_grpc?:               OtlpGrpcClass | null;
    otlp_http?:               OtlpHTTPClass | null;
    [property: string]: any;
}

export interface ConsoleClass {
}

export interface OtlpFileDevelopmentClass {
    output_stream?: null | string;
}

export interface OtlpGrpcClass {
    certificate_file?:        null | string;
    client_certificate_file?: null | string;
    client_key_file?:         null | string;
    compression?:             null | string;
    endpoint?:                null | string;
    headers?:                 HeaderElement[];
    headers_list?:            null | string;
    insecure?:                boolean | null;
    timeout?:                 number | null;
}

export interface HeaderElement {
    name:  string;
    value: null | string;
}

export interface OtlpHTTPClass {
    certificate_file?:        null | string;
    client_certificate_file?: null | string;
    client_key_file?:         null | string;
    compression?:             null | string;
    encoding?:                Encoding;
    endpoint?:                null | string;
    headers?:                 HeaderElement[];
    headers_list?:            null | string;
    timeout?:                 number | null;
}

export enum Encoding {
    JSON = "json",
    Protobuf = "protobuf",
}

export interface PurpleSimple {
    exporter: PurpleExporter;
}

export interface MeterProviderClass {
    exemplar_filter?:                  ExemplarFilter;
    "meter_configurator/development"?: Meter;
    readers:                           ReaderElement[];
    views?:                            ViewElement[];
}

export enum ExemplarFilter {
    AlwaysOff = "always_off",
    AlwaysOn = "always_on",
    TraceBased = "trace_based",
}

export interface Meter {
    default_config?: MeterConfiguratorDevelopmentDefaultConfig;
    meters?:         MeterElement[];
}

export interface MeterConfiguratorDevelopmentDefaultConfig {
    disabled?: boolean;
}

export interface MeterElement {
    config?: MeterConfiguratorDevelopmentDefaultConfig;
    name?:   string;
}

export interface ReaderElement {
    periodic?: Periodic;
    pull?:     Pull;
}

export interface Periodic {
    cardinality_limits?: CardinalityLimits;
    exporter:            PeriodicExporter;
    interval?:           number | null;
    producers?:          ProducerElement[];
    timeout?:            number | null;
}

export interface CardinalityLimits {
    counter?:                    number | null;
    default?:                    number | null;
    gauge?:                      number | null;
    histogram?:                  number | null;
    observable_counter?:         number | null;
    observable_gauge?:           number | null;
    observable_up_down_counter?: number | null;
    up_down_counter?:            number | null;
}

export interface PeriodicExporter {
    console?:                 ConsoleClass | null;
    "otlp_file/development"?: ExporterOtlpFileDevelopment | null;
    otlp_grpc?:               ExporterOtlpGrpc | null;
    otlp_http?:               ExporterOtlpHTTP | null;
    [property: string]: any;
}

export interface ExporterOtlpFileDevelopment {
    default_histogram_aggregation?: DefaultHistogramAggregation;
    output_stream?:                 null | string;
    temporality_preference?:        TemporalityPreference;
}

export enum DefaultHistogramAggregation {
    Base2ExponentialBucketHistogram = "base2_exponential_bucket_histogram",
    ExplicitBucketHistogram = "explicit_bucket_histogram",
}

export enum TemporalityPreference {
    Cumulative = "cumulative",
    Delta = "delta",
    LowMemory = "low_memory",
}

export interface ExporterOtlpGrpc {
    certificate_file?:              null | string;
    client_certificate_file?:       null | string;
    client_key_file?:               null | string;
    compression?:                   null | string;
    default_histogram_aggregation?: DefaultHistogramAggregation;
    endpoint?:                      null | string;
    headers?:                       HeaderElement[];
    headers_list?:                  null | string;
    insecure?:                      boolean | null;
    temporality_preference?:        TemporalityPreference;
    timeout?:                       number | null;
}

export interface ExporterOtlpHTTP {
    certificate_file?:              null | string;
    client_certificate_file?:       null | string;
    client_key_file?:               null | string;
    compression?:                   null | string;
    default_histogram_aggregation?: DefaultHistogramAggregation;
    encoding?:                      Encoding;
    endpoint?:                      null | string;
    headers?:                       HeaderElement[];
    headers_list?:                  null | string;
    temporality_preference?:        TemporalityPreference;
    timeout?:                       number | null;
}

export interface ProducerElement {
    opencensus?: OpencensusClass | null;
    [property: string]: any;
}

export interface OpencensusClass {
}

export interface Pull {
    cardinality_limits?: CardinalityLimits;
    exporter:            PullExporter;
    producers?:          ProducerElement[];
}

export interface PullExporter {
    "prometheus/development"?: PrometheusDevelopmentClass | null;
    [property: string]: any;
}

export interface PrometheusDevelopmentClass {
    host?:                          null | string;
    port?:                          number | null;
    with_resource_constant_labels?: WithResourceConstantLabels;
    without_scope_info?:            boolean | null;
    without_type_suffix?:           boolean | null;
    without_units?:                 boolean | null;
}

export interface WithResourceConstantLabels {
    excluded?: string[];
    included?: string[];
}

export interface ViewElement {
    selector?: Selector;
    stream?:   Stream;
}

export interface Selector {
    instrument_name?:  null | string;
    instrument_type?:  InstrumentType;
    meter_name?:       null | string;
    meter_schema_url?: null | string;
    meter_version?:    null | string;
    unit?:             null | string;
}

export enum InstrumentType {
    Counter = "counter",
    Gauge = "gauge",
    Histogram = "histogram",
    ObservableCounter = "observable_counter",
    ObservableGauge = "observable_gauge",
    ObservableUpDownCounter = "observable_up_down_counter",
    UpDownCounter = "up_down_counter",
}

export interface Stream {
    aggregation?:                   Aggregation;
    aggregation_cardinality_limit?: number | null;
    attribute_keys?:                WithResourceConstantLabels;
    description?:                   null | string;
    name?:                          null | string;
}

export interface Aggregation {
    base2_exponential_bucket_histogram?: Base2ExponentialBucketHistogramClass | null;
    default?:                            DefaultClass | null;
    drop?:                               DropClass | null;
    explicit_bucket_histogram?:          ExplicitBucketHistogramClass | null;
    last_value?:                         LastValueClass | null;
    sum?:                                SumClass | null;
}

export interface Base2ExponentialBucketHistogramClass {
    max_scale?:      number | null;
    max_size?:       number | null;
    record_min_max?: boolean | null;
}

export interface DefaultClass {
}

export interface DropClass {
}

export interface ExplicitBucketHistogramClass {
    boundaries?:     number[];
    record_min_max?: boolean | null;
}

export interface LastValueClass {
}

export interface SumClass {
}

export interface PropagatorObject {
    composite?:      CompositeElement[];
    composite_list?: null | string;
    [property: string]: any;
}

export interface CompositeElement {
    b3?:           B3Class | null;
    b3multi?:      B3MultiClass | null;
    baggage?:      BaggageClass | null;
    jaeger?:       JaegerClass | null;
    ottrace?:      OttraceClass | null;
    tracecontext?: TracecontextClass | null;
    [property: string]: any;
}

export interface B3Class {
}

export interface B3MultiClass {
}

export interface BaggageClass {
}

export interface JaegerClass {
}

export interface OttraceClass {
}

export interface TracecontextClass {
}

export interface ResourceClass {
    attributes?:              AttributeElement[];
    attributes_list?:         null | string;
    "detection/development"?: DetectionDevelopment;
    schema_url?:              null | string;
}

export interface AttributeElement {
    name:  string;
    type?: TypeEnum | null;
    value: Array<boolean | number | string> | boolean | number | null | string;
}

export enum TypeEnum {
    Bool = "bool",
    BoolArray = "bool_array",
    Double = "double",
    DoubleArray = "double_array",
    Int = "int",
    IntArray = "int_array",
    String = "string",
    StringArray = "string_array",
}

export interface DetectionDevelopment {
    attributes?: WithResourceConstantLabels;
    detectors?:  { [key: string]: any }[];
}

export interface TracerProviderClass {
    limits?:                            TracerProviderLimits;
    processors:                         ProcessorObject[];
    sampler?:                           Sampler;
    "tracer_configurator/development"?: Tracer;
}

export interface TracerProviderLimits {
    attribute_count_limit?:        number | null;
    attribute_value_length_limit?: number | null;
    event_attribute_count_limit?:  number | null;
    event_count_limit?:            number | null;
    link_attribute_count_limit?:   number | null;
    link_count_limit?:             number | null;
}

export interface ProcessorObject {
    batch?:  FluffyBatch;
    simple?: FluffySimple;
    [property: string]: any;
}

export interface FluffyBatch {
    export_timeout?:        number | null;
    exporter:               FluffyExporter;
    max_export_batch_size?: number | null;
    max_queue_size?:        number | null;
    schedule_delay?:        number | null;
}

export interface FluffyExporter {
    console?:                 ConsoleClass | null;
    "otlp_file/development"?: OtlpFileDevelopmentClass | null;
    otlp_grpc?:               OtlpGrpcClass | null;
    otlp_http?:               OtlpHTTPClass | null;
    zipkin?:                  ZipkinClass | null;
    [property: string]: any;
}

export interface ZipkinClass {
    endpoint?: null | string;
    timeout?:  number | null;
}

export interface FluffySimple {
    exporter: FluffyExporter;
}

export interface ParentBasedClass {
    local_parent_not_sampled?:  Sampler;
    local_parent_sampled?:      Sampler;
    remote_parent_not_sampled?: Sampler;
    remote_parent_sampled?:     Sampler;
    root?:                      Sampler;
}

export interface JaegerRemoteClass {
    endpoint?:        null | string;
    initial_sampler?: Sampler;
    interval?:        number | null;
}

export interface Sampler {
    always_off?:           AlwaysOffClass | null;
    always_on?:            AlwaysOnClass | null;
    jaeger_remote?:        JaegerRemoteClass | null;
    parent_based?:         ParentBasedClass | null;
    trace_id_ratio_based?: TraceIDRatioBasedClass | null;
    [property: string]: any;
}

export interface AlwaysOffClass {
}

export interface AlwaysOnClass {
}

export interface TraceIDRatioBasedClass {
    ratio?: number | null;
}

export interface Tracer {
    default_config?: TracerConfiguratorDevelopmentDefaultConfig;
    tracers?:        TracerElement[];
}

export interface TracerConfiguratorDevelopmentDefaultConfig {
    disabled: boolean;
}

export interface TracerElement {
    config: TracerConfiguratorDevelopmentDefaultConfig;
    name:   string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toOpentelemetryConfiguration(json: string): OpentelemetryConfiguration {
        return cast(JSON.parse(json), r("OpentelemetryConfiguration"));
    }

    public static opentelemetryConfigurationToJson(value: OpentelemetryConfiguration): string {
        return JSON.stringify(uncast(value, r("OpentelemetryConfiguration")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "OpentelemetryConfiguration": o([
        { json: "attribute_limits", js: "attribute_limits", typ: u(undefined, r("AttributeLimits")) },
        { json: "disabled", js: "disabled", typ: u(undefined, u(true, null)) },
        { json: "file_format", js: "file_format", typ: "" },
        { json: "instrumentation/development", js: "instrumentation/development", typ: u(undefined, r("InstrumentationDevelopment")) },
        { json: "log_level", js: "log_level", typ: u(undefined, u(null, "")) },
        { json: "logger_provider", js: "logger_provider", typ: u(undefined, r("LoggerProviderClass")) },
        { json: "meter_provider", js: "meter_provider", typ: u(undefined, r("MeterProviderClass")) },
        { json: "propagator", js: "propagator", typ: u(undefined, r("PropagatorObject")) },
        { json: "resource", js: "resource", typ: u(undefined, r("ResourceClass")) },
        { json: "tracer_provider", js: "tracer_provider", typ: u(undefined, r("TracerProviderClass")) },
    ], "any"),
    "AttributeLimits": o([
        { json: "attribute_count_limit", js: "attribute_count_limit", typ: u(undefined, u(0, null)) },
        { json: "attribute_value_length_limit", js: "attribute_value_length_limit", typ: u(undefined, u(0, null)) },
    ], "any"),
    "InstrumentationDevelopment": o([
        { json: "cpp", js: "cpp", typ: u(undefined, m("any")) },
        { json: "dotnet", js: "dotnet", typ: u(undefined, m("any")) },
        { json: "erlang", js: "erlang", typ: u(undefined, m("any")) },
        { json: "general", js: "general", typ: u(undefined, r("General")) },
        { json: "go", js: "go", typ: u(undefined, m("any")) },
        { json: "java", js: "java", typ: u(undefined, m("any")) },
        { json: "js", js: "js", typ: u(undefined, m("any")) },
        { json: "php", js: "php", typ: u(undefined, m("any")) },
        { json: "python", js: "python", typ: u(undefined, m("any")) },
        { json: "ruby", js: "ruby", typ: u(undefined, m("any")) },
        { json: "rust", js: "rust", typ: u(undefined, m("any")) },
        { json: "swift", js: "swift", typ: u(undefined, m("any")) },
    ], false),
    "General": o([
        { json: "http", js: "http", typ: u(undefined, r("HTTP")) },
        { json: "peer", js: "peer", typ: u(undefined, r("Peer")) },
    ], false),
    "HTTP": o([
        { json: "client", js: "client", typ: u(undefined, r("Client")) },
        { json: "server", js: "server", typ: u(undefined, r("Server")) },
    ], false),
    "Client": o([
        { json: "request_captured_headers", js: "request_captured_headers", typ: u(undefined, a("")) },
        { json: "response_captured_headers", js: "response_captured_headers", typ: u(undefined, a("")) },
    ], false),
    "Server": o([
        { json: "request_captured_headers", js: "request_captured_headers", typ: u(undefined, a("")) },
        { json: "response_captured_headers", js: "response_captured_headers", typ: u(undefined, a("")) },
    ], false),
    "Peer": o([
        { json: "service_mapping", js: "service_mapping", typ: u(undefined, a(r("ServiceMapping"))) },
    ], false),
    "ServiceMapping": o([
        { json: "peer", js: "peer", typ: "" },
        { json: "service", js: "service", typ: "" },
    ], false),
    "LoggerProviderClass": o([
        { json: "limits", js: "limits", typ: u(undefined, r("LoggerProviderLimits")) },
        { json: "logger_configurator/development", js: "logger_configurator/development", typ: u(undefined, r("Logger")) },
        { json: "processors", js: "processors", typ: a(r("ProcessorElement")) },
    ], false),
    "LoggerProviderLimits": o([
        { json: "attribute_count_limit", js: "attribute_count_limit", typ: u(undefined, u(0, null)) },
        { json: "attribute_value_length_limit", js: "attribute_value_length_limit", typ: u(undefined, u(0, null)) },
    ], false),
    "Logger": o([
        { json: "default_config", js: "default_config", typ: u(undefined, r("LoggerConfiguratorDevelopmentDefaultConfig")) },
        { json: "loggers", js: "loggers", typ: u(undefined, a(r("LoggerElement"))) },
    ], false),
    "LoggerConfiguratorDevelopmentDefaultConfig": o([
        { json: "disabled", js: "disabled", typ: u(undefined, true) },
    ], false),
    "LoggerElement": o([
        { json: "config", js: "config", typ: u(undefined, r("LoggerConfiguratorDevelopmentDefaultConfig")) },
        { json: "name", js: "name", typ: u(undefined, "") },
    ], false),
    "ProcessorElement": o([
        { json: "batch", js: "batch", typ: u(undefined, r("PurpleBatch")) },
        { json: "simple", js: "simple", typ: u(undefined, r("PurpleSimple")) },
    ], "any"),
    "PurpleBatch": o([
        { json: "export_timeout", js: "export_timeout", typ: u(undefined, u(0, null)) },
        { json: "exporter", js: "exporter", typ: r("PurpleExporter") },
        { json: "max_export_batch_size", js: "max_export_batch_size", typ: u(undefined, u(0, null)) },
        { json: "max_queue_size", js: "max_queue_size", typ: u(undefined, u(0, null)) },
        { json: "schedule_delay", js: "schedule_delay", typ: u(undefined, u(0, null)) },
    ], false),
    "PurpleExporter": o([
        { json: "console", js: "console", typ: u(undefined, u(r("ConsoleClass"), null)) },
        { json: "otlp_file/development", js: "otlp_file/development", typ: u(undefined, u(r("OtlpFileDevelopmentClass"), null)) },
        { json: "otlp_grpc", js: "otlp_grpc", typ: u(undefined, u(r("OtlpGrpcClass"), null)) },
        { json: "otlp_http", js: "otlp_http", typ: u(undefined, u(r("OtlpHTTPClass"), null)) },
    ], "any"),
    "ConsoleClass": o([
    ], false),
    "OtlpFileDevelopmentClass": o([
        { json: "output_stream", js: "output_stream", typ: u(undefined, u(null, "")) },
    ], false),
    "OtlpGrpcClass": o([
        { json: "certificate_file", js: "certificate_file", typ: u(undefined, u(null, "")) },
        { json: "client_certificate_file", js: "client_certificate_file", typ: u(undefined, u(null, "")) },
        { json: "client_key_file", js: "client_key_file", typ: u(undefined, u(null, "")) },
        { json: "compression", js: "compression", typ: u(undefined, u(null, "")) },
        { json: "endpoint", js: "endpoint", typ: u(undefined, u(null, "")) },
        { json: "headers", js: "headers", typ: u(undefined, a(r("HeaderElement"))) },
        { json: "headers_list", js: "headers_list", typ: u(undefined, u(null, "")) },
        { json: "insecure", js: "insecure", typ: u(undefined, u(true, null)) },
        { json: "timeout", js: "timeout", typ: u(undefined, u(0, null)) },
    ], false),
    "HeaderElement": o([
        { json: "name", js: "name", typ: "" },
        { json: "value", js: "value", typ: u(null, "") },
    ], false),
    "OtlpHTTPClass": o([
        { json: "certificate_file", js: "certificate_file", typ: u(undefined, u(null, "")) },
        { json: "client_certificate_file", js: "client_certificate_file", typ: u(undefined, u(null, "")) },
        { json: "client_key_file", js: "client_key_file", typ: u(undefined, u(null, "")) },
        { json: "compression", js: "compression", typ: u(undefined, u(null, "")) },
        { json: "encoding", js: "encoding", typ: u(undefined, r("Encoding")) },
        { json: "endpoint", js: "endpoint", typ: u(undefined, u(null, "")) },
        { json: "headers", js: "headers", typ: u(undefined, a(r("HeaderElement"))) },
        { json: "headers_list", js: "headers_list", typ: u(undefined, u(null, "")) },
        { json: "timeout", js: "timeout", typ: u(undefined, u(0, null)) },
    ], false),
    "PurpleSimple": o([
        { json: "exporter", js: "exporter", typ: r("PurpleExporter") },
    ], false),
    "MeterProviderClass": o([
        { json: "exemplar_filter", js: "exemplar_filter", typ: u(undefined, r("ExemplarFilter")) },
        { json: "meter_configurator/development", js: "meter_configurator/development", typ: u(undefined, r("Meter")) },
        { json: "readers", js: "readers", typ: a(r("ReaderElement")) },
        { json: "views", js: "views", typ: u(undefined, a(r("ViewElement"))) },
    ], false),
    "Meter": o([
        { json: "default_config", js: "default_config", typ: u(undefined, r("MeterConfiguratorDevelopmentDefaultConfig")) },
        { json: "meters", js: "meters", typ: u(undefined, a(r("MeterElement"))) },
    ], false),
    "MeterConfiguratorDevelopmentDefaultConfig": o([
        { json: "disabled", js: "disabled", typ: u(undefined, true) },
    ], false),
    "MeterElement": o([
        { json: "config", js: "config", typ: u(undefined, r("MeterConfiguratorDevelopmentDefaultConfig")) },
        { json: "name", js: "name", typ: u(undefined, "") },
    ], false),
    "ReaderElement": o([
        { json: "periodic", js: "periodic", typ: u(undefined, r("Periodic")) },
        { json: "pull", js: "pull", typ: u(undefined, r("Pull")) },
    ], false),
    "Periodic": o([
        { json: "cardinality_limits", js: "cardinality_limits", typ: u(undefined, r("CardinalityLimits")) },
        { json: "exporter", js: "exporter", typ: r("PeriodicExporter") },
        { json: "interval", js: "interval", typ: u(undefined, u(0, null)) },
        { json: "producers", js: "producers", typ: u(undefined, a(r("ProducerElement"))) },
        { json: "timeout", js: "timeout", typ: u(undefined, u(0, null)) },
    ], false),
    "CardinalityLimits": o([
        { json: "counter", js: "counter", typ: u(undefined, u(0, null)) },
        { json: "default", js: "default", typ: u(undefined, u(0, null)) },
        { json: "gauge", js: "gauge", typ: u(undefined, u(0, null)) },
        { json: "histogram", js: "histogram", typ: u(undefined, u(0, null)) },
        { json: "observable_counter", js: "observable_counter", typ: u(undefined, u(0, null)) },
        { json: "observable_gauge", js: "observable_gauge", typ: u(undefined, u(0, null)) },
        { json: "observable_up_down_counter", js: "observable_up_down_counter", typ: u(undefined, u(0, null)) },
        { json: "up_down_counter", js: "up_down_counter", typ: u(undefined, u(0, null)) },
    ], false),
    "PeriodicExporter": o([
        { json: "console", js: "console", typ: u(undefined, u(r("ConsoleClass"), null)) },
        { json: "otlp_file/development", js: "otlp_file/development", typ: u(undefined, u(r("ExporterOtlpFileDevelopment"), null)) },
        { json: "otlp_grpc", js: "otlp_grpc", typ: u(undefined, u(r("ExporterOtlpGrpc"), null)) },
        { json: "otlp_http", js: "otlp_http", typ: u(undefined, u(r("ExporterOtlpHTTP"), null)) },
    ], "any"),
    "ExporterOtlpFileDevelopment": o([
        { json: "default_histogram_aggregation", js: "default_histogram_aggregation", typ: u(undefined, r("DefaultHistogramAggregation")) },
        { json: "output_stream", js: "output_stream", typ: u(undefined, u(null, "")) },
        { json: "temporality_preference", js: "temporality_preference", typ: u(undefined, r("TemporalityPreference")) },
    ], false),
    "ExporterOtlpGrpc": o([
        { json: "certificate_file", js: "certificate_file", typ: u(undefined, u(null, "")) },
        { json: "client_certificate_file", js: "client_certificate_file", typ: u(undefined, u(null, "")) },
        { json: "client_key_file", js: "client_key_file", typ: u(undefined, u(null, "")) },
        { json: "compression", js: "compression", typ: u(undefined, u(null, "")) },
        { json: "default_histogram_aggregation", js: "default_histogram_aggregation", typ: u(undefined, r("DefaultHistogramAggregation")) },
        { json: "endpoint", js: "endpoint", typ: u(undefined, u(null, "")) },
        { json: "headers", js: "headers", typ: u(undefined, a(r("HeaderElement"))) },
        { json: "headers_list", js: "headers_list", typ: u(undefined, u(null, "")) },
        { json: "insecure", js: "insecure", typ: u(undefined, u(true, null)) },
        { json: "temporality_preference", js: "temporality_preference", typ: u(undefined, r("TemporalityPreference")) },
        { json: "timeout", js: "timeout", typ: u(undefined, u(0, null)) },
    ], false),
    "ExporterOtlpHTTP": o([
        { json: "certificate_file", js: "certificate_file", typ: u(undefined, u(null, "")) },
        { json: "client_certificate_file", js: "client_certificate_file", typ: u(undefined, u(null, "")) },
        { json: "client_key_file", js: "client_key_file", typ: u(undefined, u(null, "")) },
        { json: "compression", js: "compression", typ: u(undefined, u(null, "")) },
        { json: "default_histogram_aggregation", js: "default_histogram_aggregation", typ: u(undefined, r("DefaultHistogramAggregation")) },
        { json: "encoding", js: "encoding", typ: u(undefined, r("Encoding")) },
        { json: "endpoint", js: "endpoint", typ: u(undefined, u(null, "")) },
        { json: "headers", js: "headers", typ: u(undefined, a(r("HeaderElement"))) },
        { json: "headers_list", js: "headers_list", typ: u(undefined, u(null, "")) },
        { json: "temporality_preference", js: "temporality_preference", typ: u(undefined, r("TemporalityPreference")) },
        { json: "timeout", js: "timeout", typ: u(undefined, u(0, null)) },
    ], false),
    "ProducerElement": o([
        { json: "opencensus", js: "opencensus", typ: u(undefined, u(r("OpencensusClass"), null)) },
    ], "any"),
    "OpencensusClass": o([
    ], false),
    "Pull": o([
        { json: "cardinality_limits", js: "cardinality_limits", typ: u(undefined, r("CardinalityLimits")) },
        { json: "exporter", js: "exporter", typ: r("PullExporter") },
        { json: "producers", js: "producers", typ: u(undefined, a(r("ProducerElement"))) },
    ], false),
    "PullExporter": o([
        { json: "prometheus/development", js: "prometheus/development", typ: u(undefined, u(r("PrometheusDevelopmentClass"), null)) },
    ], "any"),
    "PrometheusDevelopmentClass": o([
        { json: "host", js: "host", typ: u(undefined, u(null, "")) },
        { json: "port", js: "port", typ: u(undefined, u(0, null)) },
        { json: "with_resource_constant_labels", js: "with_resource_constant_labels", typ: u(undefined, r("WithResourceConstantLabels")) },
        { json: "without_scope_info", js: "without_scope_info", typ: u(undefined, u(true, null)) },
        { json: "without_type_suffix", js: "without_type_suffix", typ: u(undefined, u(true, null)) },
        { json: "without_units", js: "without_units", typ: u(undefined, u(true, null)) },
    ], false),
    "WithResourceConstantLabels": o([
        { json: "excluded", js: "excluded", typ: u(undefined, a("")) },
        { json: "included", js: "included", typ: u(undefined, a("")) },
    ], false),
    "ViewElement": o([
        { json: "selector", js: "selector", typ: u(undefined, r("Selector")) },
        { json: "stream", js: "stream", typ: u(undefined, r("Stream")) },
    ], false),
    "Selector": o([
        { json: "instrument_name", js: "instrument_name", typ: u(undefined, u(null, "")) },
        { json: "instrument_type", js: "instrument_type", typ: u(undefined, r("InstrumentType")) },
        { json: "meter_name", js: "meter_name", typ: u(undefined, u(null, "")) },
        { json: "meter_schema_url", js: "meter_schema_url", typ: u(undefined, u(null, "")) },
        { json: "meter_version", js: "meter_version", typ: u(undefined, u(null, "")) },
        { json: "unit", js: "unit", typ: u(undefined, u(null, "")) },
    ], false),
    "Stream": o([
        { json: "aggregation", js: "aggregation", typ: u(undefined, r("Aggregation")) },
        { json: "aggregation_cardinality_limit", js: "aggregation_cardinality_limit", typ: u(undefined, u(0, null)) },
        { json: "attribute_keys", js: "attribute_keys", typ: u(undefined, r("WithResourceConstantLabels")) },
        { json: "description", js: "description", typ: u(undefined, u(null, "")) },
        { json: "name", js: "name", typ: u(undefined, u(null, "")) },
    ], false),
    "Aggregation": o([
        { json: "base2_exponential_bucket_histogram", js: "base2_exponential_bucket_histogram", typ: u(undefined, u(r("Base2ExponentialBucketHistogramClass"), null)) },
        { json: "default", js: "default", typ: u(undefined, u(r("DefaultClass"), null)) },
        { json: "drop", js: "drop", typ: u(undefined, u(r("DropClass"), null)) },
        { json: "explicit_bucket_histogram", js: "explicit_bucket_histogram", typ: u(undefined, u(r("ExplicitBucketHistogramClass"), null)) },
        { json: "last_value", js: "last_value", typ: u(undefined, u(r("LastValueClass"), null)) },
        { json: "sum", js: "sum", typ: u(undefined, u(r("SumClass"), null)) },
    ], false),
    "Base2ExponentialBucketHistogramClass": o([
        { json: "max_scale", js: "max_scale", typ: u(undefined, u(0, null)) },
        { json: "max_size", js: "max_size", typ: u(undefined, u(0, null)) },
        { json: "record_min_max", js: "record_min_max", typ: u(undefined, u(true, null)) },
    ], false),
    "DefaultClass": o([
    ], false),
    "DropClass": o([
    ], false),
    "ExplicitBucketHistogramClass": o([
        { json: "boundaries", js: "boundaries", typ: u(undefined, a(3.14)) },
        { json: "record_min_max", js: "record_min_max", typ: u(undefined, u(true, null)) },
    ], false),
    "LastValueClass": o([
    ], false),
    "SumClass": o([
    ], false),
    "PropagatorObject": o([
        { json: "composite", js: "composite", typ: u(undefined, a(r("CompositeElement"))) },
        { json: "composite_list", js: "composite_list", typ: u(undefined, u(null, "")) },
    ], "any"),
    "CompositeElement": o([
        { json: "b3", js: "b3", typ: u(undefined, u(r("B3Class"), null)) },
        { json: "b3multi", js: "b3multi", typ: u(undefined, u(r("B3MultiClass"), null)) },
        { json: "baggage", js: "baggage", typ: u(undefined, u(r("BaggageClass"), null)) },
        { json: "jaeger", js: "jaeger", typ: u(undefined, u(r("JaegerClass"), null)) },
        { json: "ottrace", js: "ottrace", typ: u(undefined, u(r("OttraceClass"), null)) },
        { json: "tracecontext", js: "tracecontext", typ: u(undefined, u(r("TracecontextClass"), null)) },
    ], "any"),
    "B3Class": o([
    ], false),
    "B3MultiClass": o([
    ], false),
    "BaggageClass": o([
    ], false),
    "JaegerClass": o([
    ], false),
    "OttraceClass": o([
    ], false),
    "TracecontextClass": o([
    ], false),
    "ResourceClass": o([
        { json: "attributes", js: "attributes", typ: u(undefined, a(r("AttributeElement"))) },
        { json: "attributes_list", js: "attributes_list", typ: u(undefined, u(null, "")) },
        { json: "detection/development", js: "detection/development", typ: u(undefined, r("DetectionDevelopment")) },
        { json: "schema_url", js: "schema_url", typ: u(undefined, u(null, "")) },
    ], false),
    "AttributeElement": o([
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: u(undefined, u(r("TypeEnum"), null)) },
        { json: "value", js: "value", typ: u(a(u(true, 3.14, "")), true, 3.14, null, "") },
    ], false),
    "DetectionDevelopment": o([
        { json: "attributes", js: "attributes", typ: u(undefined, r("WithResourceConstantLabels")) },
        { json: "detectors", js: "detectors", typ: u(undefined, a(m("any"))) },
    ], false),
    "TracerProviderClass": o([
        { json: "limits", js: "limits", typ: u(undefined, r("TracerProviderLimits")) },
        { json: "processors", js: "processors", typ: a(r("ProcessorObject")) },
        { json: "sampler", js: "sampler", typ: u(undefined, r("Sampler")) },
        { json: "tracer_configurator/development", js: "tracer_configurator/development", typ: u(undefined, r("Tracer")) },
    ], false),
    "TracerProviderLimits": o([
        { json: "attribute_count_limit", js: "attribute_count_limit", typ: u(undefined, u(0, null)) },
        { json: "attribute_value_length_limit", js: "attribute_value_length_limit", typ: u(undefined, u(0, null)) },
        { json: "event_attribute_count_limit", js: "event_attribute_count_limit", typ: u(undefined, u(0, null)) },
        { json: "event_count_limit", js: "event_count_limit", typ: u(undefined, u(0, null)) },
        { json: "link_attribute_count_limit", js: "link_attribute_count_limit", typ: u(undefined, u(0, null)) },
        { json: "link_count_limit", js: "link_count_limit", typ: u(undefined, u(0, null)) },
    ], false),
    "ProcessorObject": o([
        { json: "batch", js: "batch", typ: u(undefined, r("FluffyBatch")) },
        { json: "simple", js: "simple", typ: u(undefined, r("FluffySimple")) },
    ], "any"),
    "FluffyBatch": o([
        { json: "export_timeout", js: "export_timeout", typ: u(undefined, u(0, null)) },
        { json: "exporter", js: "exporter", typ: r("FluffyExporter") },
        { json: "max_export_batch_size", js: "max_export_batch_size", typ: u(undefined, u(0, null)) },
        { json: "max_queue_size", js: "max_queue_size", typ: u(undefined, u(0, null)) },
        { json: "schedule_delay", js: "schedule_delay", typ: u(undefined, u(0, null)) },
    ], false),
    "FluffyExporter": o([
        { json: "console", js: "console", typ: u(undefined, u(r("ConsoleClass"), null)) },
        { json: "otlp_file/development", js: "otlp_file/development", typ: u(undefined, u(r("OtlpFileDevelopmentClass"), null)) },
        { json: "otlp_grpc", js: "otlp_grpc", typ: u(undefined, u(r("OtlpGrpcClass"), null)) },
        { json: "otlp_http", js: "otlp_http", typ: u(undefined, u(r("OtlpHTTPClass"), null)) },
        { json: "zipkin", js: "zipkin", typ: u(undefined, u(r("ZipkinClass"), null)) },
    ], "any"),
    "ZipkinClass": o([
        { json: "endpoint", js: "endpoint", typ: u(undefined, u(null, "")) },
        { json: "timeout", js: "timeout", typ: u(undefined, u(0, null)) },
    ], false),
    "FluffySimple": o([
        { json: "exporter", js: "exporter", typ: r("FluffyExporter") },
    ], false),
    "ParentBasedClass": o([
        { json: "local_parent_not_sampled", js: "local_parent_not_sampled", typ: u(undefined, r("Sampler")) },
        { json: "local_parent_sampled", js: "local_parent_sampled", typ: u(undefined, r("Sampler")) },
        { json: "remote_parent_not_sampled", js: "remote_parent_not_sampled", typ: u(undefined, r("Sampler")) },
        { json: "remote_parent_sampled", js: "remote_parent_sampled", typ: u(undefined, r("Sampler")) },
        { json: "root", js: "root", typ: u(undefined, r("Sampler")) },
    ], false),
    "JaegerRemoteClass": o([
        { json: "endpoint", js: "endpoint", typ: u(undefined, u(null, "")) },
        { json: "initial_sampler", js: "initial_sampler", typ: u(undefined, r("Sampler")) },
        { json: "interval", js: "interval", typ: u(undefined, u(0, null)) },
    ], false),
    "Sampler": o([
        { json: "always_off", js: "always_off", typ: u(undefined, u(r("AlwaysOffClass"), null)) },
        { json: "always_on", js: "always_on", typ: u(undefined, u(r("AlwaysOnClass"), null)) },
        { json: "jaeger_remote", js: "jaeger_remote", typ: u(undefined, u(r("JaegerRemoteClass"), null)) },
        { json: "parent_based", js: "parent_based", typ: u(undefined, u(r("ParentBasedClass"), null)) },
        { json: "trace_id_ratio_based", js: "trace_id_ratio_based", typ: u(undefined, u(r("TraceIDRatioBasedClass"), null)) },
    ], "any"),
    "AlwaysOffClass": o([
    ], false),
    "AlwaysOnClass": o([
    ], false),
    "TraceIDRatioBasedClass": o([
        { json: "ratio", js: "ratio", typ: u(undefined, u(3.14, null)) },
    ], false),
    "Tracer": o([
        { json: "default_config", js: "default_config", typ: u(undefined, r("TracerConfiguratorDevelopmentDefaultConfig")) },
        { json: "tracers", js: "tracers", typ: u(undefined, a(r("TracerElement"))) },
    ], false),
    "TracerConfiguratorDevelopmentDefaultConfig": o([
        { json: "disabled", js: "disabled", typ: true },
    ], false),
    "TracerElement": o([
        { json: "config", js: "config", typ: r("TracerConfiguratorDevelopmentDefaultConfig") },
        { json: "name", js: "name", typ: "" },
    ], false),
    "Encoding": [
        "json",
        "protobuf",
    ],
    "ExemplarFilter": [
        "always_off",
        "always_on",
        "trace_based",
    ],
    "DefaultHistogramAggregation": [
        "base2_exponential_bucket_histogram",
        "explicit_bucket_histogram",
    ],
    "TemporalityPreference": [
        "cumulative",
        "delta",
        "low_memory",
    ],
    "InstrumentType": [
        "counter",
        "gauge",
        "histogram",
        "observable_counter",
        "observable_gauge",
        "observable_up_down_counter",
        "up_down_counter",
    ],
    "TypeEnum": [
        "bool",
        "bool_array",
        "double",
        "double_array",
        "int",
        "int_array",
        "string",
        "string_array",
    ],
};
