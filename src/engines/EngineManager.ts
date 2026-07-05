import type { BaseEngine } from "./BaseEngine";

export class EngineManager {
  private engines: BaseEngine[] = [];

  register(engine: BaseEngine): void {
    this.engines.push(engine);
  }

  initializeAll(): void {
    this.engines.forEach((engine) => engine.initialize());
  }

  getEngines(): BaseEngine[] {
    return this.engines;
  }
}
