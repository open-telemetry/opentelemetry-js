import { NoopContextManager } from "../../context/NoopContextManager";
import { ExperimentalContextManager } from "./types";

export class ExperimentalNoopContextManager extends NoopContextManager implements ExperimentalContextManager {
  attach() {
    return Symbol("NOOP Context Symbol");
  }

  detach(_token: symbol) {/* nothing */}
}