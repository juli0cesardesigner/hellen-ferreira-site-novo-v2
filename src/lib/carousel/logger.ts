export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface CarouselLogEntry {
  id: string;
  timestamp: string; // ISO string
  level: LogLevel;
  message: string;
  details?: string;
  stack?: string;
}

const STORAGE_KEY = 'hlln_carousel_debug_logs';
const MAX_LOGS = 300;

export function getCarouselLogs(): CarouselLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Falha ao ler logs do carrossel:', e);
    return [];
  }
}

export function addCarouselLog(
  level: LogLevel,
  message: string,
  details?: unknown,
  error?: unknown
): CarouselLogEntry {
  const timestamp = new Date().toISOString();
  const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let detailsStr: string | undefined;
  if (details !== undefined) {
    if (typeof details === 'string') {
      detailsStr = details;
    } else {
      try {
        detailsStr = JSON.stringify(details, null, 2);
      } catch {
        detailsStr = String(details);
      }
    }
  }

  let stackStr: string | undefined;
  if (error instanceof Error) {
    stackStr = error.stack;
    if (!detailsStr) detailsStr = error.message;
  } else if (error) {
    stackStr = String(error);
  }

  const entry: CarouselLogEntry = {
    id,
    timestamp,
    level,
    message,
    details: detailsStr,
    stack: stackStr
  };

  if (typeof window !== 'undefined') {
    try {
      const current = getCarouselLogs();
      current.push(entry);
      if (current.length > MAX_LOGS) {
        current.splice(0, current.length - MAX_LOGS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // Se localStorage estourar quota, mantém os 50 mais recentes
      try {
        const current = getCarouselLogs().slice(-50);
        current.push(entry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      } catch {
        // Fallback silencioso
      }
    }
  }

  return entry;
}

export function clearCarouselLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent
  }
}

export function formatLogsForExport(logs: CarouselLogEntry[]): string {
  if (logs.length === 0) return 'Nenhum log registrado até o momento.';
  return logs
    .map((l) => {
      const parts = [`[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`];
      if (l.details) parts.push(`Detalhes: ${l.details}`);
      if (l.stack) parts.push(`Stack: ${l.stack}`);
      return parts.join('\n');
    })
    .join('\n----------------------------------------\n');
}

let consoleInstrumented = false;

export function initCarouselLogger(): void {
  if (typeof window === 'undefined' || consoleInstrumented) return;
  consoleInstrumented = true;

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: unknown[]) => {
    originalError.apply(console, args);
    try {
      const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      addCarouselLog('error', `[Console.error] ${msg}`);
    } catch {
      // Safe fallback
    }
  };

  console.warn = (...args: unknown[]) => {
    originalWarn.apply(console, args);
    try {
      const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      addCarouselLog('warn', `[Console.warn] ${msg}`);
    } catch {
      // Safe fallback
    }
  };
}

