import { describe, it, expect, vi } from 'vitest';
import { CATALOG_SLIDES } from './templates/catalog';
import { Slide01T2 } from './templates/gallery02/slides/Slide01T2';
import React from 'react';
import { render } from '@testing-library/react';
import { triggerDownload } from './exporter';

describe('Custom Slide Slots and Exporter', () => {
  it('should render Slide01T2 with custom dynamic slot IDs matching checklist', () => {
    // Pegar a lâmina 1 do Template 2 do catálogo (com 3 imagens)
    const t2Item = CATALOG_SLIDES.find((c) => c.slideDefinition.id === 't2-slide-1');
    expect(t2Item).toBeDefined();

    // Simular o comportamento de applyAddSlides gerando slots personalizados
    const uniqueSlideId = 'custom_slide_test_123';
    const newSlots = t2Item!.slideDefinition.slots.map((s, idx) => ({
      ...s,
      id: `${uniqueSlideId}_slot_${idx}`
    }));

    expect(newSlots.length).toBe(3);
    const [slot0, slot1, slot2] = newSlots;

    // Simular preenchimento das 3 fotos pelo usuário
    const slotsData = {
      [slot0.id]: {
        id: slot0.id,
        label: slot0.label,
        imageUrl: 'data:image/png;base64,FAKE_IMG_0',
        adjustments: { zoom: 100, x: 50, y: 50 }
      },
      [slot1.id]: {
        id: slot1.id,
        label: slot1.label,
        imageUrl: 'data:image/png;base64,FAKE_IMG_1',
        adjustments: { zoom: 100, x: 50, y: 50 }
      },
      [slot2.id]: {
        id: slot2.id,
        label: slot2.label,
        imageUrl: 'data:image/png;base64,FAKE_IMG_2',
        adjustments: { zoom: 100, x: 50, y: 50 }
      }
    };

    // Renderizar Slide01T2 passando slots={newSlots}
    const { container } = render(
      React.createElement(Slide01T2, {
        aspectRatio: '4:5',
        slotsData,
        activeSlotId: slot0.id,
        onSelectSlot: vi.fn(),
        onUpdateAdjustments: vi.fn(),
        onPickImage: vi.fn(),
        slots: newSlots
      })
    );

    // As 3 imagens devem estar presentes no DOM com seus respectivos data URLs
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(3);
    expect(images[0].getAttribute('src')).toBe('data:image/png;base64,FAKE_IMG_0');
    expect(images[1].getAttribute('src')).toBe('data:image/png;base64,FAKE_IMG_1');
    expect(images[2].getAttribute('src')).toBe('data:image/png;base64,FAKE_IMG_2');

    // Validação de fotos pendentes (regra do handleExport):
    const uniqueSlotIds = new Set(newSlots.map((s) => s.id));
    const emptySlots = Array.from(uniqueSlotIds).filter((id) => !slotsData[id]?.imageUrl);
    expect(emptySlots.length).toBe(0); // ZERO fotos pendentes!
  });

  it('should trigger direct download without opening navigator.share', () => {
    // Verifica que triggerDownload cria o elemento de link e clica nele
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    // Mock URL.createObjectURL e revokeObjectURL
    const fakeBlobUrl = 'blob:http://localhost/test-blob-123';
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue(fakeBlobUrl);
    globalThis.URL.revokeObjectURL = vi.fn();

    // DataUrl mínimo válido em base64 (1x1 transparente)
    const fakeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    triggerDownload(fakeDataUrl, 'test-lamina-01.png');

    expect(appendSpy).toHaveBeenCalled();
    const linkElement = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(linkElement.tagName.toLowerCase()).toBe('a');
    expect(linkElement.download).toBe('test-lamina-01.png');
    expect(linkElement.href).toBe(fakeBlobUrl);
    expect(removeSpy).toHaveBeenCalledWith(linkElement);
  });

  it('should not render ghost image in Slide02 when polaroidSlot has no imageUrl', async () => {
    const { Slide02 } = await import('./templates/gallery01/slides/Slide02');
    const { container } = render(
      React.createElement(Slide02, {
        aspectRatio: '4:5',
        slotsData: {},
        onSelectSlot: vi.fn(),
        onUpdateAdjustments: vi.fn(),
        onPickImage: vi.fn()
      })
    );

    // Sem imagens no slotsData, não deve haver nenhuma tag <img> (especialmente hero-newborn)
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(0);
  });

  it('should handle invalid dataUrl safely in dataUrlToBlob without throwing', async () => {
    const { dataUrlToBlob } = await import('./exporter');
    const blob1 = dataUrlToBlob('invalid-string');
    expect(blob1).toBeInstanceOf(Blob);
    expect(blob1.size).toBe(0);

    const blob2 = dataUrlToBlob('data:image/png;base64,');
    expect(blob2).toBeInstanceOf(Blob);
  });

  it('should call onPickImage when an active slot button is tapped in SlideSlotsChecklist', async () => {
    const { SlideSlotsChecklist } = await import('@/components/carousel/SlideSlotsChecklist');
    const { fireEvent } = await import('@testing-library/react');

    const onPickImageMock = vi.fn();
    const onSelectSlotMock = vi.fn();

    const mockSlides = [
      {
        id: 's1',
        slideNumber: 1,
        component: () => null,
        slots: [{ id: 'slot_active', label: 'Foto 01', defaultPlaceholder: '' }]
      }
    ];

    const { getByText } = render(
      React.createElement(SlideSlotsChecklist, {
        slides: mockSlides,
        currentSlideIndex: 0,
        slotsData: {},
        activeSlotId: 'slot_active',
        onSelectSlot: onSelectSlotMock,
        onPickImage: onPickImageMock
      })
    );

    const button = getByText('Foto 01');
    fireEvent.click(button);

    // Como já está ativo, clicar deve acionar onPickImage diretamente
    expect(onPickImageMock).toHaveBeenCalledWith('slot_active');
    expect(onSelectSlotMock).not.toHaveBeenCalled();
  });
});
