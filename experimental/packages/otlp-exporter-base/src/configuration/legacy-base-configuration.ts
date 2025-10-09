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
import { HeadersFactory } from './otlp-http-configuration';

export interface OTLPExporterConfigBase {
  /**
   * Custom headers that will be attached to the HTTP request that's sent to the endpoint.
   *
   * @remarks
   * Prefer using a plain object over a factory function wherever possible.
   * If using a factory function (`HttpAgentFactory`), **do not import `http` or `https` at the top of the file**.
   * Instead, use dynamic `import()` or `require()` to load the module. This ensures that the `http` or `https`
   * module is not loaded before `@opentelemetry/instrumentation-http` can instrument it.
   *
   * Functions passed to the exporter MUST not throw errors.
   *
   * @example <caption> Using headers options directly: </caption>
   * headers: {
   *  Authorization: "Api-Token my-secret-token",
   * }
   *
   * @example <caption> Using a factory with dynamic import for OAuth token refresh using a lazy-loaded 'openid-client': </caption>
   * export class OpenIdTokenProvider {
   *   private _cachedToken: string | null = null;
   *   private _tokenExpiresAt: number | null = null;
   *   private _cachedIssuer: any = null;
   *
   *   constructor(
   *     private readonly _issuerUrl: string,
   *     private readonly _clientId: string,
   *     private readonly _clientSecret: string,
   *     private readonly _scope: string
   *   ) {}
   *
   *   private async _getIssuer() {
   *     if (!this._cachedIssuer) {
   *       // avoid loading the library unless we need to,
   *       // this ensures that instrumentation-http can do its job
   *       const { Issuer } = await import('openid-client');
   *       this._cachedIssuer = await Issuer.discover(this._issuerUrl);
   *     }
   *     return this._cachedIssuer;
   *   }
   *
   *   public async getAccessToken(): Promise<string> {
   *     const now = Date.now() / 1000; // seconds
   *     if (this._cachedToken && this._tokenExpiresAt && now < this._tokenExpiresAt - 60) {
   *       return this._cachedToken;
   *     }
   *
   *     const issuer = await this._getIssuer();
   *     const client = new issuer.Client({
   *       client_id: this._clientId,
   *       client_secret: this._clientSecret,
   *     });
   *
   *     const tokenSet = await client.grant({
   *       grant_type: 'client_credentials',
   *       scope: this._scope,
   *     });
   *
   *     this._cachedToken = tokenSet.access_token;
   *     this._tokenExpiresAt = tokenSet.expires_at;
   *
   *     return this._cachedToken;
   *   }
   * }
   *
   * const oidcTokenProvider = new OpenIdTokenProvider(
   *   'https://your-issuer.example',
   *   'your-client-id',
   *   'your-client-secret',
   *   'your-scope'
   * );
   *
   * // ... fast-forward to when you create the exporter ...
   *
   * headers: async () => {
   *   return {
   *     Authorization: `Bearer ${await oidcTokenProvider.getAccessToken()}`,
   *   };
   * };
   */
  headers?: Record<string, string> | HeadersFactory;
  url?: string;
  concurrencyLimit?: number;
  /** Maximum time the OTLP exporter will wait for each batch export.
   * The default value is 10000ms. */
  timeoutMillis?: number;
}
