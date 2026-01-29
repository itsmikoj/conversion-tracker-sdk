"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const LOG_LEVELS = {
    none: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
};
class Logger {
    constructor(level = 'info', prefix = '[ConversionTracker]', enableTimestamp = true) {
        this.handlers = [];
        this.level = level;
        this.prefix = prefix;
        this.enableTimestamp = enableTimestamp;
    }
    setLevel(level) {
        this.level = level;
    }
    addHandler(handler) {
        this.handlers.push(handler);
    }
    error(message, data) {
        this.log('error', message, data);
    }
    warn(message, data) {
        this.log('warn', message, data);
    }
    info(message, data) {
        this.log('info', message, data);
    }
    debug(message, data) {
        this.log('debug', message, data);
    }
    log(level, message, data) {
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
            }
            catch (error) {
                console.error('Logger handler error:', error);
            }
        });
    }
    group(label) {
        if (LOG_LEVELS.debug <= LOG_LEVELS[this.level]) {
            console.group(label);
        }
    }
    groupEnd() {
        if (LOG_LEVELS.debug <= LOG_LEVELS[this.level]) {
            console.groupEnd();
        }
    }
    table(data) {
        if (LOG_LEVELS.debug <= LOG_LEVELS[this.level]) {
            console.table(data);
        }
    }
}
exports.Logger = Logger;
