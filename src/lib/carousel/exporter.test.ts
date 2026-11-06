import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { getExportTimestamp, formatExportFilename, exportSlidesSequentially, dataUrlToBlob } from './exporter';
import { ExportResultModal } from '@/components/carousel/ExportResultModal';

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

  it('should render slides for the official modal without triggering automatic anchor downloads', async () => {
    const fakeDataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const mockCtx = {
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      fillStyle: '#ffffff',
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      drawImage: vi.fn()
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(fakeDataUrl);

    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');
    const progressSpy = vi.fn();

    const slideEl = document.createElement('div');
    const results = await exportSlidesSequentially(
      [{ id: 'slide-1', number: 1, element: slideEl }],
      '4:5',
      progressSpy,
      { templateName: 'Galeria Visual 01' }
    );

    expect(results).toHaveLength(1);
    expect(results[0].number).toBe(1);
    expect(results[0].filename).toMatch(/^galeria-visual-01_\d{8}_\d{6}_lamina_01\.png$/);
    expect(results[0].dataUrl).toBe(fakeDataUrl);
    expect(results[0].blob.size).toBeGreaterThan(0);
    expect(progressSpy).toHaveBeenCalledWith(1, 1, 1);
    expect(anchorClickSpy).not.toHaveBeenCalled();

    // Test multiple slides and empty array edge case
    const multiResults = await exportSlidesSequentially(
      [
        { id: 'slide-1', number: 1, element: slideEl },
        { id: 'slide-3', number: 3, element: slideEl }
      ],
      '9:16',
      progressSpy,
      { templateName: 'Galeria Visual 01' }
    );
    expect(multiResults).toHaveLength(2);
    expect(multiResults[0].number).toBe(1);
    expect(multiResults[1].number).toBe(3);
    expect(anchorClickSpy).not.toHaveBeenCalled();

    const emptyResults = await exportSlidesSequentially([], '4:5');
    expect(emptyResults).toEqual([]);
    expect(anchorClickSpy).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('should open ExportResultModal with touch-callout enabled on preview image and only download on explicit button click', () => {
    const fakeDataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const blob = dataUrlToBlob(fakeDataUrl);

    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/modal-test');
    globalThis.URL.revokeObjectURL = vi.fn();
    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const { getByAltText, getByText } = render(
      React.createElement(ExportResultModal, {
        isOpen: true,
        onClose: vi.fn(),
        results: [
          {
            number: 1,
            filename: 'galeria-visual-01_20261106_082750_lamina_01.png',
            dataUrl: fakeDataUrl,
            blob
          }
        ]
      })
    );

    // Opening the official modal must NOT trigger any automatic download
    expect(anchorClickSpy).not.toHaveBeenCalled();

    // Preview image must override parent select-none so iOS long-press "Salvar em Fotos" works
    const previewImg = getByAltText('Lâmina #1') as HTMLImageElement;
    expect(previewImg).toBeDefined();
    expect(previewImg.className).toContain('select-auto');
    expect(previewImg.style.getPropertyValue('-webkit-touch-callout') || (previewImg.style as unknown as Record<string, string>).WebkitTouchCallout).toBe('default');

    // Clicking the manual download button triggers the download
    const downloadBtn = getByText('Baixar Lâmina #1 (.png)');
    fireEvent.click(downloadBtn);
    expect(anchorClickSpy).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });
});
