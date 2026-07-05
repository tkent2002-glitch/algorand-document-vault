import { ConfigurationManager } from "./ConfigurationManager";
import { Logger } from "./Logger";
import { APP_NAME, APP_STAGE, APP_VERSION } from "./Version";

export class ApplicationManager {
  static initialize(): void {
    Logger.info(`${APP_NAME} v${APP_VERSION}`);
    Logger.info(`Stage: ${APP_STAGE}`);
    Logger.info(`Environment: ${ConfigurationManager.getEnvironment()}`);
  }
}
