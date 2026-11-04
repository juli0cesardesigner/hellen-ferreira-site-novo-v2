import { describe, it, expect, beforeEach } from 'vitest';
import {
  addCarouselLog,
  getCarouselLogs,
  clearCarouselLogs,
  formatLogsForExport
} from './logger';

describe('Carousel Silent Logger', () => {
  beforeEach(() => {
    clearCarouselLogs();
  });

  it('should add and retrieve logs with timestamp and level', () => {
    addCarouselLog('info', 'Test info log', { foo: 'bar' });
    addCarouselLog('warn', 'Test warn log');
    addCarouselLog('error', 'Test error log', undefined, new Error('Test explosion'));

    const logs = getCarouselLogs();
    expect(logs.length).toBe(3);

    expect(logs[0].level).toBe('info');
    expect(logs[0].message).toBe('Test info log');
    expect(logs[0].details).toContain('"foo": "bar"');

    expect(logs[1].level).toBe('warn');
    expect(logs[1].message).toBe('Test warn log');

    expect(logs[2].level).toBe('error');
    expect(logs[2].message).toBe('Test error log');
    expect(logs[2].stack).toBeDefined();
    expect(logs[2].details).toBe('Test explosion');
  });

  it('should format logs for clipboard export', () => {
    addCarouselLog('info', 'Slide rendered', { width: 1080 });
    const logs = getCarouselLogs();
    const formatted = formatLogsForExport(logs);

    expect(formatted).toContain('[INFO] Slide rendered');
    expect(formatted).toContain('Detalhes: {');
  });

  it('should clear logs completely', () => {
    addCarouselLog('info', 'Log to be cleared');
    expect(getCarouselLogs().length).toBe(1);

    clearCarouselLogs();
    expect(getCarouselLogs().length).toBe(0);
  });

  it('should capture console.error and console.warn when initCarouselLogger is called', async () => {
    const { initCarouselLogger } = await import('./logger');
    initCarouselLogger();

    console.error('Simulated fatal error on iPhone');
    console.warn('Simulated warning');

    const logs = getCarouselLogs();
    const errorLog = logs.find((l) => l.message.includes('Simulated fatal error'));
    const warnLog = logs.find((l) => l.message.includes('Simulated warning'));

    expect(errorLog).toBeDefined();
    expect(errorLog?.level).toBe('error');
    expect(warnLog).toBeDefined();
    expect(warnLog?.level).toBe('warn');
  });
});
