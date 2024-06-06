import { Context, ContextManager } from "../../context/types"

export interface ExperimentalContextManager extends ContextManager {
  /**
     * @experimental this operation should be considered experimental and may make use of experimental APIs.
     * 
     * Make a context active in the current execution.
     * For more info, see {@Link ContextAPI.attach}.
     * 
     * @param context context to make active in the current execution
     * @returns a restore key
     */
  attach(context: Context): symbol;

  /**
   * @experimental this operation should be considered experimental and may make use of experimental APIs.
   *
   * Restore the context which was active when attach was called using the restore
   * token returned by attach.
   * For more info, see {@Link ContextAPI.detach}.
   *
   * @param token the restore token returned by attach
   */
  detach(token: symbol): void;
}