import { ContextAPI } from "../../api/context";
import { Context } from "../../context/types";
import { ExperimentalContextManager } from "../context/types";
import { ExperimentalNoopContextManager } from "../context/ExperimentalNoopContextManager";

const NOOP_CONTEXT_MANAGER = new ExperimentalNoopContextManager();

export class ExperimentalContextAPI extends ContextAPI {
  /**
   * @experimental this operation should be considered experimental and may make use of experimental APIs.
   * {@link with} should be preferred over `attach`/{@link detach} unless there are strong reasons to use this method.
   * 
   * Make a context active in the current execution. Returns a unique restore
   * key which must be used with detach to restore the previous context.
   * 
   * The context will remain the active context for the entire asynchronous
   * execution unless another context is made active by calling `attach`,
   * {@link with}, or {@link detach}, or if a {@link with} callback ends.
   * 
   * If `attach` is used within a {@link with} callback, the context which was active
   * before {@link with} was called will be made the active context when the callback
   * ends.
   * 
   * Note that every call to this operation should result in a corresponding call to {@link detach} in the reverse order.
   * 
   * @example <caption>Example of using context.attach to make context active in a sibling execution</caption>
   * 
   * ```typescript
   * function func1() {
   *   api.context.attach(ctx1)
   * }
   * 
   * function func2() {
   *   api.context.active() // returns ctx1
   * }
   * 
   * func1() // ctx1 is made active within this execution
   * func2() // ctx1 is still active
   * ```
   * 
   * @example <caption>Example of using context.with to override the context set by context.attach</caption>
   * 
   * ```typescript
   * function func1() {
   *   api.context.attach(ctx1)
   * }
   * 
   * function func2() {
   *   api.context.active() // returns ctx2
   * }
   * 
   * func1()
   * api.context.active() // returns ctx1
   * api.context.with(ctx2, func2) // run func2 with ctx2 active
   * api.context.active() // returns ctx1
   * ```
   * 
   * @example <caption>Example of incorrect use of context.attach inside a context.with callback. This is incorrect because attach is called within a with callback, but there is no corresponding detach within the same callback.</caption>
   * 
   * ```typescript
   * function foo() {
   *   api.context.active()     // returns ctx1
   *   api.context.attach(ctx2) // make ctx2 active
   *   api.context.active()     // returns ctx2
   * }
   * 
   * api.context.active() // returns root context
   * api.context.with(ctx1, foo)
   * api.context.active() // returns root context
   * ```
   * 
   * @param context context to make active in the current execution
   * @returns a restore key
   */
  public attach(context: Context): symbol {
    return this._getContextManager().attach(context);
  }

  /**
   * @experimental this operation should be considered experimental and may make use of experimental APIs.
   * {@link with} should be preferred over {@link attach}/`detach` unless there are strong reasons to use this method.
   *
   * Restore the context which was active when attach was called using the restore
   * token returned by attach.
   *
   * @param token the restore token returned by attach
   */
  public detach(token: symbol): void {
    return this._getContextManager().detach(token);
  }

  /**
   * @experimental this operation should be considered experimental and may make use of experimental APIs.
   * Stable context API should be preferred over experimental unless there are strong reasons to use experimental APIs.
   * 
   * Get experimental context manager. If the currently registered context manager does not have the required
   * experimental functions, a noop context manager will be returned.
   */
  protected override _getContextManager(): ExperimentalContextManager {
    const manager = super._getContextManager() as any;
    if (typeof manager["attach"] === "function" && typeof manager["detach"] === "function") {
      return manager;
    }
    return NOOP_CONTEXT_MANAGER;
  }
}