/**
 * Structured Logging System for FJ Store
 * Implements standard logging levels with timestamping and environment awareness.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
  timestamp?: string;
}

class Logger {
  private level: LogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || "info";

  private getLogLevelPriority(level: LogLevel): number {
    const priorities: Record<LogLevel, number> = {
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
    };
    return priorities[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.getLogLevelPriority(level) >= this.getLogLevelPriority(this.level);
  }

  private formatMessage(level: LogLevel, payload: LogPayload): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${payload.message}`;
  }

  public debug(message: string, context?: Record<string, unknown>) {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", { message, context }), context || "");
    }
  }

  public info(message: string, context?: Record<string, unknown>) {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", { message, context }), context || "");
    }
  }

  public warn(message: string, context?: Record<string, unknown>) {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", { message, context }), context || "");
    }
  }

  public error(message: string, error?: unknown, context?: Record<string, unknown>) {
    if (this.shouldLog("error")) {
      console.error(
        this.formatMessage("error", { message, context, error }),
        error || "",
        context || ""
      );
    }
  }
}

export const logger = new Logger();
