import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileLoggerService implements LoggerService {
    private logDir: string;
    private logFile: string;

    constructor() {
        // Create logs directory in the project root
        this.logDir = path.join(process.cwd(), 'logs');
        this.logFile = path.join(this.logDir, 'application.log');

        // Ensure logs directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private writeLog(level: string, message: any, context?: string) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? `[${context}] ` : '';
        const messageStr = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
        const logEntry = `${timestamp} [${level}] ${contextStr}${messageStr}\n`;

        // Write to file
        fs.appendFileSync(this.logFile, logEntry);

        // Also output to console for compatibility
        console.log(logEntry.trim());
    }

    log(message: any, context?: string) {
        this.writeLog('LOG', message, context);
    }

    error(message: any, trace?: string, context?: string) {
        this.writeLog('ERROR', message, context);
        if (trace) {
            this.writeLog('ERROR', `Stack: ${trace}`, context);
        }
    }

    warn(message: any, context?: string) {
        this.writeLog('WARN', message, context);
    }

    debug(message: any, context?: string) {
        this.writeLog('DEBUG', message, context);
    }

    verbose(message: any, context?: string) {
        this.writeLog('VERBOSE', message, context);
    }

    // Custom method for email-specific logging
    logEmail(type: string, data: any) {
        this.writeLog('EMAIL', `[${type}] ${JSON.stringify(data, null, 2)}`);
    }
}
