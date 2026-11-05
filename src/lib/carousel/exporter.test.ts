import { describe, it, expect } from 'vitest';
import { getExportTimestamp, formatExportFilename } from './exporter';

describe('Exporter Unique Filename', () => {
  it('should format timestamp as AAAAMMDD_HHMMSS', () => {
    // 2026-11-05 14:05:09
    const testDate = new Date(2026, 10, 5, 14, 5, 9);
    const stamp = getExportTimestamp(testDate);
    expect(stamp).toBe('20261105_140509');
  });

  it('should generate unique filename with template, date, time and slide number (template + AAAAMMDD + HHMMSS)', () => {
    const stamp = '20261105_140509';
    const filename1 = formatExportFilename('Galeria 01', 1, stamp);
    const filename2 = formatExportFilename('Galeria 01', 2, stamp);

    expect(filename1).toBe('galeria-01_20261105_140509_lamina_01.png');
    expect(filename2).toBe('galeria-01_20261105_140509_lamina_02.png');
    expect(filename1).not.toBe(filename2);
  });

  it('should sanitize template names removing special chars and accents', () => {
    const stamp = '20261105_140509';
    const filename = formatExportFilename('Galeria Visual 02 (Seamless)', 3, stamp);
    expect(filename).toBe('galeria-visual-02-seamless_20261105_140509_lamina_03.png');
  });

  it('should produce distinct filenames across different timestamps preventing file overwrites', () => {
    const stampA = '20261105_140509';
    const stampB = '20261105_140515';

    const fileA = formatExportFilename('Galeria 01', 1, stampA);
    const fileB = formatExportFilename('Galeria 01', 1, stampB);

    expect(fileA).not.toBe(fileB);
  });
});
