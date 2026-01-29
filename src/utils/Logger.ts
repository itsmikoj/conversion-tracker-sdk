type LogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private enableTimestamp: boolean;
  private handlers: Array<(level: string, message: string, data?: any) => void> = [];

  constructor(level: LogLevel = 'info', prefix: string = '[ConversionTracker]', enableTimestamp: boolean = true) {
    this.level = level;
    this.prefix = prefix;
    this.enableTimestamp = enableTimestamp;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  addHandler(handler: (level: string, message: string, data?: any) => void): void {
    this.handlers.push(handler);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (LOG_LEVELS[level] > LOG_LEVELS[this.level]) {
      return;
    }

    const timestamp = this.enableTimestamp ? new Date().toISOString() : '';
    const formattedMessage = `${this.prefix} ${timestamp} [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'error':
        console.error(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      case 'debug':
        console.debug(formattedMessage, data || '');
        break;
    }

    this.handlers.forEach(handler => {
      try {
        handler(level, message, data);
      } catch (error) {
        console.error('Logger handler error:', error);
      }
    });
  }

  group(label: string): void {
    if (LOG_LEVELS.debug <= LOG_LEVELS[this.level]) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (LOG_LEVELS.debug <= LOG_LEVELS[this.level]) {
      console.groupEnd();
    }
  }

  table(data: any): void {
    if (LOG_LEVELS.debug <= LOG_LEVELS[this.level]) {
      console.table(data);
    }
  }
}
