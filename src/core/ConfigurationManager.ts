export type AppEnvironment = "development" | "production" | "test";

export class ConfigurationManager {
  static getEnvironment(): AppEnvironment {
    return import.meta.env.MODE as AppEnvironment;
  }

  static isDevelopment(): boolean {
    return this.getEnvironment() === "development";
  }

  static isProduction(): boolean {
    return this.getEnvironment() === "production";
  }
}
