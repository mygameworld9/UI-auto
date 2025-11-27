
type MetricType = 'TTFT' | 'LATENCY' | 'SIZE' | 'TOKENS';
type EventType = 'ERROR' | 'HALLUCINATION' | 'STREAM_START' | 'STREAM_COMPLETE';

interface TelemetryEvent {
  traceId: string;
  timestamp: number;
  type: 'metric' | 'event';
  name: string;
  value: any;
  details?: any;
}

type TelemetryListener = (event: TelemetryEvent) => void;

class TelemetryService {
  private static instance: TelemetryService;
  private traces = new Map<string, number>();
  private listeners = new Set<TelemetryListener>();

  private constructor() {}

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: TelemetryEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  public startTrace(actionName: string): string {
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.traces.set(traceId, performance.now());
    
    console.groupCollapsed(`%c[Telemetry] Start Trace: ${actionName} (${traceId})`, 'color: #3b82f6; font-weight: bold;');
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();

    this.notify({
      traceId,
      timestamp: Date.now(),
      type: 'event',
      name: 'STREAM_START',
      value: actionName
    });

    return traceId;
  }

  public logMetric(traceId: string, metric: MetricType, value: number) {
    const styles = {
      TTFT: 'color: #10b981; font-weight: bold;',
      LATENCY: 'color: #f59e0b; font-weight: bold;',
      SIZE: 'color: #8b5cf6; font-weight: bold;',
      TOKENS: 'color: #6366f1; font-weight: bold;',
    };

    console.log(`%c[Metric] ${metric}: ${value.toFixed(2)}ms`, styles[metric] || 'color: gray');

    this.notify({
      traceId,
      timestamp: Date.now(),
      type: 'metric',
      name: metric,
      value: value
    });
  }

  public logEvent(traceId: string, event: EventType, details: object) {
    const styles = {
      ERROR: 'color: #ef4444; font-weight: bold; background: #fee2e2; padding: 2px 4px; rounded: 2px;',
      HALLUCINATION: 'color: #ec4899; font-weight: bold;',
      STREAM_START: 'color: #3b82f6;',
      STREAM_COMPLETE: 'color: #10b981;',
    };

    if (event === 'ERROR' || event === 'HALLUCINATION') {
      console.groupCollapsed(`%c[Event] ${event}`, styles[event]);
      console.table(details);
      console.groupEnd();
    } else {
      console.log(`%c[Event] ${event}`, styles[event], details);
    }

    this.notify({
      traceId,
      timestamp: Date.now(),
      type: 'event',
      name: event,
      value: details
    });
  }

  public endTrace(traceId: string) {
    if (this.traces.has(traceId)) {
      const startTime = this.traces.get(traceId)!;
      const duration = performance.now() - startTime;
      this.logMetric(traceId, 'LATENCY', duration);
      this.traces.delete(traceId);
      
      this.notify({
        traceId,
        timestamp: Date.now(),
        type: 'event',
        name: 'STREAM_COMPLETE',
        value: duration
      });
    }
  }

  public getStartTime(traceId: string): number | undefined {
    return this.traces.get(traceId);
  }
}

export const telemetry = TelemetryService.getInstance();
