import type { EngineStatus } from "./EngineStatus";

export abstract class BaseEngine {
  protected status: EngineStatus = "idle";

  abstract readonly name: string;

  getStatus(): EngineStatus {
    return this.status;
  }

  initialize(): void {
    this.status = "initializing";
    this.status = "ready";
  }

  reset(): void {
    this.status = "idle";
  }
}
