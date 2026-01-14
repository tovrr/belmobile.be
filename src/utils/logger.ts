/**
 * STRUCTURED LOGGER - BELMOBILE
 * 
 * Centralized logging utility for Operation Stability.
 * Focuses on critical business events (Quotes, Leads, Payments).
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMetadata {
    flow?: 'repair' | 'buyback' | 'b2b' | 'kiosk' | 'general';
    lang?: string;
    deviceId?: string;
    quoteId?: string;
    leadId?: string;
    userId?: string;
    action?: string;
    [key: string]: any;
}

class Logger {
    private isProduction = process.env.NODE_ENV === 'production';

    private format(level: LogLevel, message: string, meta: LogMetadata = {}) {
        const timestamp = new Date().toISOString();
        const context = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta,
            environment: process.env.NODE_ENV,
            service: 'belmobile-next-platform'
        };

        return context;
    }

    info(message: string, meta: LogMetadata = {}, error?: any) {
        const log = this.format('info', message, {
            ...meta,
            errorMessage: error?.message,
            errorStack: error?.stack,
        });
        if (this.isProduction) {
            // In production, we use structured strings for log aggregators (like Vercel Logs / Datadog)
            console.log(JSON.stringify(log));
        } else {
            console.log(`[INFO] ${message}`, meta, error);
        }
    }

    warn(message: string, meta: LogMetadata = {}, error?: any) {
        const log = this.format('warn', message, {
            ...meta,
            errorMessage: error?.message,
            errorStack: error?.stack,
        });
        if (this.isProduction) {
            console.warn(JSON.stringify(log));
        } else {
            console.warn(`[WARN] ${message}`, meta, error);
        }
    }

    error(message: string, meta: LogMetadata = {}, error?: any) {
        const log = this.format('error', message, {
            ...meta,
            errorMessage: error?.message,
            errorStack: error?.stack,
        });

        if (this.isProduction) {
            console.error(JSON.stringify(log));
        } else {
            console.error(`[ERROR] ${message}`, meta, error);
        }

        // Note: Sentry is handled separately in instrumentation.ts / config files,
        // but we could integrate it here if needed for specific triggers.
    }

    debug(message: string, meta: LogMetadata = {}) {
        if (!this.isProduction) {
            const log = this.format('debug', message, meta);
            console.debug(`[DEBUG] ${message}`, meta);
        }
    }

    /**
     * Specialized tracker for Business Events
     */
    trackEvent(name: string, meta: LogMetadata) {
        this.info(`Event: ${name}`, { ...meta, isEvent: true });
    }
}

export const logger = new Logger();
