import Logger from 'seq-logging'

export type SeqLogLevel = 'Verbose' | 'Debug' | 'Information' | 'Warning' | 'Error' | 'Fatal';

interface SeqLoggerConfig {
    serverUrl?: string;
    apiKey?: string;
    maxBatchingTime?: number;
    eventSizeLimit?: number;
    batchSizeLimit?: number;
    requestTimeout?: number;
    onError: (e: Error) => void;
}

interface SeqEvent {
    timestamp: Date;
    level?: SeqLogLevel;
    messageTemplate?: string;
    properties?: object;
    exception?: string;
}

class SeqLogger {
    constructor(public config: SeqLoggerConfig) {
    }

    emit(event: SeqEvent): void {}
}

const seqLogger: SeqLogger = new ((Logger as any).Logger)({ serverUrl: 'http://192.168.1.5:5341', onError: () => null })

export const log = (level?: SeqLogLevel, messageTemplate?: string, properties?: object, exception?: string) => {
    let timestamp = new Date()
    seqLogger.emit({
        timestamp,
        level,
        messageTemplate,
        properties,
    })
}
