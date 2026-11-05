'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_TEMPLATES } from '@/lib/carousel/templates';
import { CarouselTemplate, AspectRatio, ASPECT_RATIOS, PhotoSlotData, PhotoSlotAdjustment, CarouselProject } from '@/lib/carousel/types';
import { SlideView } from '@/components/carousel/SlideView';
import { DesktopControlsPanel } from '@/components/carousel/DesktopControlsPanel';
import { HomeModal } from '@/components/carousel/HomeModal';
import { SlidePickerModal } from '@/components/carousel/SlidePickerModal';
import { AutoFillModal } from '@/components/carousel/AutoFillModal';
import { InternalDialogModal, InternalModalConfig } from '@/components/carousel/InternalDialogModal';
import { SlideSlotsChecklist } from '@/components/carousel/SlideSlotsChecklist';
import { CatalogSlideItem, CATALOG_SLIDES } from '@/lib/carousel/templates/catalog';
import { exportSlidesSequentially } from '@/lib/carousel/exporter';
import { loadAllSlotData, saveSlotData, clearAllSlotData, saveProject, loadAllProjects, deleteProject } from '@/lib/carousel/storage';
import { Download, RefreshCw, ChevronLeft, ChevronRight, Plus, RotateCcw, ZoomIn, Home, Save, Check, Trash2, Terminal, Sparkles } from 'lucide-react';
import { getNextDemoPhoto } from '@/lib/carousel/demo-photos';
import { addCarouselLog, initCarouselLogger } from '@/lib/carousel/logger';
import { CarouselLogsModal } from '@/components/carousel/CarouselLogsModal';
import { ExportResultModal } from '@/components/carousel/ExportResultModal';
import { RenderedSlideResult } from '@/lib/carousel/exporter';

export default function CarouselStudioPage() {
  const [currentTemplate, setCurrentTemplate] = useState<CarouselTemplate>(AVAILABLE_TEMPLATES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [activeSlotId, setActiveSlotId] = useState<string>('');
  const [slotsData, setSlotsData] = useState<Record<string, PhotoSlotData>>({});
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number; slide: number } | null>(null);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [exportResults, setExportResults] = useState<RenderedSlideResult[] | null>(null);

  // Estados de Home, Projetos, Auto-Preenchimento e Logs
  const [isHomeOpen, setIsHomeOpen] = useState<boolean>(true);
  const [isSlidePickerOpen, setIsSlidePickerOpen] = useState<boolean>(false);
  const [isAutoFillEditorOpen, setIsAutoFillEditorOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [dialogConfig, setDialogConfig] = useState<InternalModalConfig>({
    isOpen: false,
    message: '',
    onConfirm: () => {}
  });
  const [savedProjects, setSavedProjects] = useState<CarouselProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [currentProjectName, setCurrentProjectName] = useState<string>('Meu Carrossel');
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide após inatividade (3.5 segundos)
  const triggerActivity = () => {
    setIsControlsVisible(true);
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
    }
    autoHideTimeoutRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 3500);
  };

  useEffect(() => {
    triggerActivity();
    return () => {
      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
    };
  }, [activeSlotId, currentSlideIndex]);

  // Captura erros globais, rejeições assíncronas e console silenciosamente para depuração no iPhone
  useEffect(() => {
    initCarouselLogger();

    const handleError = (event: ErrorEvent) => {
      addCarouselLog('error', `Erro de script: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }, event.error);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      addCarouselLog('error', `Promise rejeitada: ${String(event.reason)}`, undefined, event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSlotPickRef = useRef<string>('');
  const slideRefs = useRef<Record<string, HTMLElement>>({});

  // Carrega estado persistido e lista de projetos do IndexedDB apenas no carregamento inicial
  useEffect(() => {
    async function initStorage() {
      const projects = await loadAllProjects();
      setSavedProjects(projects);

      const saved = await loadAllSlotData();
      const initialMap: Record<string, PhotoSlotData> = {};

      for (const slide of currentTemplate.slides) {
        for (const slot of slide.slots) {
          if (saved[slot.id]) {
            initialMap[slot.id] = {
              id: slot.id,
              label: slot.label,
              imageUrl: saved[slot.id].dataUrl,
              adjustments: saved[slot.id].adjustments
            };
          } else {
            initialMap[slot.id] = {
              id: slot.id,
              label: slot.label,
              imageUrl: undefined,
              adjustments: { zoom: 100, x: 50, y: 50 }
            };
          }
        }
      }
      setSlotsData(initialMap);
      if (currentTemplate.slides[0]?.slots[0]) {
        setActiveSlotId(currentTemplate.slides[0].slots[0].id);
      }
    }

    initStorage();
  }, []);

  // Formatação para nomes automáticos: AAAA-MM-DD_HH-MM-SS
  const formatTimestampName = (date: Date = new Date()) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}`;
  };

  // Auto-save inteligente: Salva automaticamente no projeto atual (ou cria um novo seguindo AAAA-MM-DD_HH-MM-SS)
  const triggerAutoSaveProject = async (currentSlots: Record<string, PhotoSlotData>) => {
    const hasAnyImage = Object.values(currentSlots).some((s) => s.imageUrl);
    if (!hasAnyImage) return;

    const projId = currentProjectId || `proj_${Date.now()}`;
    const name = currentProjectId && currentProjectName ? currentProjectName : formatTimestampName();

    if (!currentProjectId) {
      setCurrentProjectId(projId);
      setCurrentProjectName(name);
    }

    const coverSlot = Object.values(currentSlots).find((s) => s.imageUrl);
    const coverThumbnail = coverSlot?.imageUrl;

    const project: CarouselProject = {
      id: projId,
      name,
      templateId: currentTemplate.id,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      aspectRatio,
      slotsData: currentSlots,
      coverThumbnail
    };

    await saveProject(project);
    const updated = await loadAllProjects();
    setSavedProjects(updated);

    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 1500);
  };

  // Ações de Projetos
  const handleSaveCurrentProject = async () => {
    const projId = currentProjectId || `proj_${Date.now()}`;
    const name = currentProjectId ? currentProjectName : formatTimestampName();
    setCurrentProjectId(projId);
    setCurrentProjectName(name);

    // Usa a primeira imagem encontrada como capa
    const coverSlot = Object.values(slotsData).find((s) => s.imageUrl);
    const coverThumbnail = coverSlot?.imageUrl;

    const project: CarouselProject = {
      id: projId,
      name,
      templateId: currentTemplate.id,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      aspectRatio,
      slotsData,
      coverThumbnail
    };

    await saveProject(project);
    const updated = await loadAllProjects();
    setSavedProjects(updated);

    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2000);
  };

  const handleOpenProject = (project: CarouselProject) => {
    setCurrentProjectId(project.id);
    setCurrentProjectName(project.name);
    setAspectRatio(project.aspectRatio || '4:5');
    setSlotsData(project.slotsData || {});

    // Encontra o template correspondente
    const tpl = AVAILABLE_TEMPLATES.find((t) => t.id === project.templateId) || AVAILABLE_TEMPLATES[0];
    setCurrentTemplate(tpl);
    setCurrentSlideIndex(0);
    if (tpl.slides[0]?.slots[0]) {
      setActiveSlotId(tpl.slides[0].slots[0].id);
    }

    // Persiste também no storage ativo
    for (const [slotId, data] of Object.entries(project.slotsData || {})) {
      saveSlotData(slotId, data.imageUrl, data.adjustments);
    }

    setIsHomeOpen(false);
  };

  const handleSelectTemplate = async (template: CarouselTemplate) => {
    setCurrentTemplate(template);
    setCurrentProjectId('');
    setCurrentProjectName(`Novo ${template.name}`);
    setCurrentSlideIndex(0);
    await clearAllSlotData();

    const emptyMap: Record<string, PhotoSlotData> = {};
    for (const slide of template.slides) {
      for (const slot of slide.slots) {
        emptyMap[slot.id] = {
          id: slot.id,
          label: slot.label,
          imageUrl: undefined,
          adjustments: { zoom: 100, x: 50, y: 50 }
        };
      }
    }
    setSlotsData(emptyMap);
    if (template.slides[0]?.slots[0]) {
      setActiveSlotId(template.slides[0].slots[0].id);
    }
    addCarouselLog('info', `Template fixo selecionado: ${template.name}`, { templateId: template.id, slideCount: template.slides.length });
    setIsHomeOpen(false);
  };

  // Seleção de template acompanhado do carregamento em lote de fotos (Auto-Preenchimento)
  const handleSelectTemplateWithPhotos = async (
    template: CarouselTemplate,
    newSlotsData: Record<string, PhotoSlotData>
  ) => {
    setCurrentTemplate(template);
    setCurrentProjectId('');
    setCurrentProjectName(`Novo ${template.name}`);
    setCurrentSlideIndex(0);
    await clearAllSlotData();

    setSlotsData(newSlotsData);
    for (const [slotId, data] of Object.entries(newSlotsData)) {
      saveSlotData(slotId, data.imageUrl, data.adjustments);
    }

    if (template.slides[0]?.slots[0]) {
      setActiveSlotId(template.slides[0].slots[0].id);
    }

    const filledCount = Object.values(newSlotsData).filter((s) => Boolean(s.imageUrl)).length;
    addCarouselLog(
      'info',
      `Template "${template.name}" carregado com auto-preenchimento de ${filledCount} fotos.`
    );
    triggerAutoSaveProject(newSlotsData);
    setIsHomeOpen(false);
  };

  // Criação de Template / Projeto Personalizado em Branco
  // Aplicação de Carrossel Gerado pelo Modo Aleatório (Opção 1 ou 2)
  const handleApplyRandomProject = async (
    randomTemplate: CarouselTemplate,
    initialSlotsData: Record<string, PhotoSlotData>
  ) => {
    setCurrentTemplate(randomTemplate);
    const projId = `proj_rand_${Date.now()}`;
    setCurrentProjectId(projId);
    setCurrentProjectName(randomTemplate.name);
    setCurrentSlideIndex(0);
    setSlotsData(initialSlotsData);

    await clearAllSlotData();
    for (const [slotId, data] of Object.entries(initialSlotsData)) {
      saveSlotData(slotId, data.imageUrl, data.adjustments);
    }

    if (randomTemplate.slides[0]?.slots[0]) {
      setActiveSlotId(randomTemplate.slides[0].slots[0].id);
    }

    triggerAutoSaveProject(initialSlotsData);
    addCarouselLog('info', `Projeto aleatório aplicado: ${randomTemplate.name}`, { slideCount: randomTemplate.slides.length });
    setIsHomeOpen(false);
  };

  const handleCreateCustomTemplate = async () => {
    const customTemplate: CarouselTemplate = {
      id: `custom_${Date.now()}`,
      name: 'Carrossel Personalizado',
      description: 'Projeto criado sob medida com lâminas personalizadas.',
      slides: []
    };
    setCurrentTemplate(customTemplate);
    setCurrentProjectId(`proj_${Date.now()}`);
    setCurrentProjectName(formatTimestampName());
    setCurrentSlideIndex(0);
    setActiveSlotId('');
    setSlotsData({});
    await clearAllSlotData();
    addCarouselLog('info', 'Criado novo carrossel personalizado em branco.');
    setIsHomeOpen(false);
  };

  // Execução direta da inserção de lâminas no carrossel
  const applyAddSlides = (itemsToAdd: CatalogSlideItem[]) => {
    let updatedSlides = [...currentTemplate.slides];
    const newSlotsDataMap: Record<string, PhotoSlotData> = { ...slotsData };
    let firstNewSlotId = '';
    const slotIdMap = new Map<string, string>();

    for (const item of itemsToAdd) {
      const nextNumber = updatedSlides.length + 1;
      const uniqueSlideId = `custom_slide_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      // Gera IDs únicos para os slots da nova lâmina para isolar fotos,
      // preservando o compartilhamento apenas se lâminas seamless consecutivas forem adicionadas juntas
      const newSlots = item.slideDefinition.slots.map((s, idx) => {
        const isSeamless = s.id.includes('seamless');
        let newId = isSeamless ? slotIdMap.get(s.id) : undefined;
        if (!newId) {
          newId = `${uniqueSlideId}_slot_${idx}`;
          if (isSeamless) {
            slotIdMap.set(s.id, newId);
          }
        }
        return {
          ...s,
          id: newId
        };
      });

      const newSlideDefinition = {
        ...item.slideDefinition,
        id: uniqueSlideId,
        slideNumber: nextNumber,
        slots: newSlots
      };

      updatedSlides.push(newSlideDefinition);

      // Sempre inicializa a lâmina em branco (sem herdar fotos anteriores)
      for (const slot of newSlots) {
        if (!newSlotsDataMap[slot.id]) {
          newSlotsDataMap[slot.id] = {
            id: slot.id,
            label: slot.label,
            imageUrl: undefined,
            adjustments: { zoom: 100, x: 50, y: 50 }
          };
          saveSlotData(slot.id, undefined, { zoom: 100, x: 50, y: 50 });
        }
      }

      if (!firstNewSlotId && newSlots[0]) {
        firstNewSlotId = newSlots[0].id;
      }
    }

    const updatedTemplate = {
      ...currentTemplate,
      slides: updatedSlides
    };

    setCurrentTemplate(updatedTemplate);
    setCurrentSlideIndex(updatedSlides.length - 1);
    setSlotsData(newSlotsDataMap);
    triggerAutoSaveProject(newSlotsDataMap);

    if (firstNewSlotId) {
      setActiveSlotId(firstNewSlotId);
    }

    addCarouselLog('info', `Inseridas ${itemsToAdd.length} lâmina(s) no carrossel personalizado. Total de lâminas: ${updatedSlides.length}`);
    setIsSlidePickerOpen(false);
  };

  // Inserção de lâmina(s) da grade no template ativo
  const handleAddSlideFromCatalog = (catalogItem: CatalogSlideItem) => {
    // Se for lâmina com foto sobreposta contínua (seamless), insere o par completo na ordem correta
    if (catalogItem.seamlessPairId) {
      const pairItem = CATALOG_SLIDES.find((c) => c.id === catalogItem.seamlessPairId);
      if (pairItem) {
        const orderedPair =
          catalogItem.slideNumber < pairItem.slideNumber
            ? [catalogItem, pairItem]
            : [pairItem, catalogItem];
        addCarouselLog(
          'info',
          'Lâmina com foto sobreposta contínua (seamless) detectada. Inserindo o par completo.'
        );
        applyAddSlides(orderedPair);
        return;
      }
    }

    applyAddSlides([catalogItem]);
  };

  // Exclusão de lâmina do carrossel atual com diálogo interno
  const handleDeleteCurrentSlide = (slideIndexToDelete: number) => {
    if (currentTemplate.slides.length <= 1) {
      setDialogConfig({
        isOpen: true,
        type: 'alert',
        title: 'Aviso',
        message: 'O carrossel precisa ter pelo menos 1 lâmina.',
        confirmLabel: 'Entendido',
        onConfirm: () => setDialogConfig((prev) => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setDialogConfig({
      isOpen: true,
      type: 'confirm',
      title: 'Excluir Lâmina',
      message: `Deseja realmente excluir a lâmina #${slideIndexToDelete + 1}?`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      onConfirm: () => {
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));

        const remainingSlides = currentTemplate.slides
          .filter((_, idx) => idx !== slideIndexToDelete)
          .map((s, idx) => ({
            ...s,
            slideNumber: idx + 1
          }));

        const updatedTemplate = {
          ...currentTemplate,
          slides: remainingSlides
        };

        const newIndex = Math.min(slideIndexToDelete, remainingSlides.length - 1);
        setCurrentTemplate(updatedTemplate);
        setCurrentSlideIndex(newIndex);

        if (remainingSlides[newIndex]?.slots[0]) {
          setActiveSlotId(remainingSlides[newIndex].slots[0].id);
        }

        triggerAutoSaveProject(slotsData);
      },
      onCancel: () => setDialogConfig((prev) => ({ ...prev, isOpen: false }))
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    const updated = await loadAllProjects();
    setSavedProjects(updated);
    if (currentProjectId === projectId) {
      setCurrentProjectId('');
    }
  };

  // Navegação de Lâminas com Auto-Scroll e Suporte a Touch
  const slideNavContainerRef = useRef<HTMLDivElement>(null);
  const slideButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const goToSlide = (idx: number) => {
    const clamped = Math.max(0, Math.min(currentTemplate.slides.length - 1, idx));
    setCurrentSlideIndex(clamped);
    if (currentTemplate.slides[clamped]?.slots[0]) {
      setActiveSlotId(currentTemplate.slides[clamped].slots[0].id);
    }
    triggerActivity();
  };

  const goToPrevSlide = () => {
    goToSlide(currentSlideIndex - 1);
  };

  const goToNextSlide = () => {
    goToSlide(currentSlideIndex + 1);
  };

  // Garante que o botão da lâmina ativa sempre role para dentro do viewport visível
  useEffect(() => {
    const activeButton = slideButtonRefs.current[currentSlideIndex];
    if (activeButton && slideNavContainerRef.current) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentSlideIndex, currentTemplate.slides.length]);

  // Suporte a gesto de deslizar (swipe) no mobile para navegar entre lâminas
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    // Se foi swipe horizontal (dx > 45px e predominantemente horizontal)
    if (dt < 400 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }
    touchStartRef.current = null;
  };

  // Atualiza ajustes
  const handleUpdateAdjustments = (slotId: string, adj: PhotoSlotAdjustment) => {
    triggerActivity();
    setSlotsData((prev) => {
      const existing = prev[slotId] || { id: slotId, label: '', adjustments: adj };
      const updated = { ...existing, adjustments: adj };
      saveSlotData(slotId, updated.imageUrl, adj);
      const newMap = { ...prev, [slotId]: updated };
      triggerAutoSaveProject(newMap);
      return newMap;
    });
  };

  // Atualiza slot completo (usado pelo painel desktop)
  const handleSlotDataChange = (newData: PhotoSlotData) => {
    setSlotsData((prev) => {
      const newMap = {
        ...prev,
        [newData.id]: newData
      };
      saveSlotData(newData.id, newData.imageUrl, newData.adjustments);
      triggerAutoSaveProject(newMap);
      return newMap;
    });
  };

  // Aplica imagem em um slot com persistência e log
  const applyImageToSlot = (slotId: string, imageUrl: string, fileName?: string) => {
    addCarouselLog('info', `Foto carregada para o slot "${slotId}"`, {
      fileName: fileName || 'imagem',
      isDemo: imageUrl.startsWith('/content/')
    });

    setSlotsData((prev) => {
      const existing = prev[slotId] || {
        id: slotId,
        label: '',
        adjustments: { zoom: 100, x: 50, y: 50 }
      };
      const updated = {
        ...existing,
        imageUrl,
        adjustments: { zoom: 100, x: 50, y: 50 }
      };
      saveSlotData(slotId, imageUrl, updated.adjustments);
      const newMap = { ...prev, [slotId]: updated };
      triggerAutoSaveProject(newMap);
      return newMap;
    });
  };

  // Suporte a Colar Foto (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const targetSlot = pendingSlotPickRef.current || activeSlotId || currentTemplate.slides[currentSlideIndex]?.slots[0]?.id;
      if (!targetSlot) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const res = ev.target?.result as string;
              applyImageToSlot(targetSlot, res, 'clipboard-image.png');
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeSlotId, currentTemplate, currentSlideIndex]);

  // Suporte a Arrastar e Soltar Foto (Drag & Drop)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetSlot = activeSlotId || currentTemplate.slides[currentSlideIndex]?.slots[0]?.id;
    if (!targetSlot) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = ev.target?.result as string;
        applyImageToSlot(targetSlot, res, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Dispara a galeria de fotos (mobile ou desktop)
  const handleTriggerPickImage = (slotId: string) => {
    pendingSlotPickRef.current = slotId;
    fileInputRef.current?.click();
  };

  // Carrega arquivo de foto selecionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetSlotId = pendingSlotPickRef.current;
    if (!file || !targetSlotId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      applyImageToSlot(targetSlotId, result, file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetAll = async () => {
    setDialogConfig({
      isOpen: true,
      type: 'confirm',
      title: 'Limpar Carrossel',
      message: 'Deseja limpar todas as fotos e ajustes das lâminas?',
      confirmLabel: 'Limpar Tudo',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));
        await clearAllSlotData();
        const resetMap: Record<string, PhotoSlotData> = {};
        for (const slide of currentTemplate.slides) {
          for (const slot of slide.slots) {
            resetMap[slot.id] = {
              id: slot.id,
              label: slot.label,
              imageUrl: undefined,
              adjustments: { zoom: 100, x: 50, y: 50 }
            };
          }
        }
        setSlotsData(resetMap);
        addCarouselLog('info', 'Todas as fotos e ajustes foram limpos.');
      },
      onCancel: () => setDialogConfig((prev) => ({ ...prev, isOpen: false }))
    });
  };

  const executeExport = async () => {
    setIsExporting(true);
    setExportProgress({ current: 0, total: currentTemplate.slides.length, slide: 1 });

    try {
      const itemsToExport = currentTemplate.slides
        .map((s) => ({
          id: s.id,
          number: s.slideNumber,
          element: slideRefs.current[s.id]
        }))
        .filter((item) => item.element);

      if (itemsToExport.length === 0) {
        addCarouselLog('warn', 'Nenhuma lâmina disponível para exportar (elementos DOM não encontrados).');
        setDialogConfig({
          isOpen: true,
          type: 'alert',
          title: 'Aviso',
          message: 'Nenhuma lâmina encontrada para exportação. Adicione pelo menos uma lâmina ao carrossel.',
          confirmLabel: 'OK',
          onConfirm: () => setDialogConfig((prev) => ({ ...prev, isOpen: false }))
        });
        return;
      }

      addCarouselLog('info', `Iniciando executeExport: ${itemsToExport.length} elementos encontrados para renderizar.`);

      const rendered = await exportSlidesSequentially(
        itemsToExport,
        aspectRatio,
        (curr, tot, sNum) => {
          setExportProgress({ current: curr, total: tot, slide: sNum });
        },
        { templateName: currentTemplate.name }
      );

      addCarouselLog('info', `Download direto disparado para ${rendered.length} lâminas.`);
      setExportResults(rendered);
    } catch (err) {
      console.error('Falha na exportação:', err);
      addCarouselLog('error', `Falha em executeExport: ${err instanceof Error ? err.message : String(err)}`, undefined, err);
      setDialogConfig({
        isOpen: true,
        type: 'alert',
        title: 'Erro na Exportação',
        message: 'Houve um erro na renderização das lâminas. Tente novamente.',
        confirmLabel: 'OK',
        onConfirm: () => setDialogConfig((prev) => ({ ...prev, isOpen: false }))
      });
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleExport = async () => {
    // Coleta todos os slots únicos de todas as lâminas
    const uniqueSlotIds = new Set<string>();
    currentTemplate.slides.forEach((slide) => {
      slide.slots.forEach((s) => uniqueSlotIds.add(s.id));
    });

    const emptySlots = Array.from(uniqueSlotIds).filter(
      (slotId) => !slotsData[slotId]?.imageUrl
    );
    const emptySlotsCount = emptySlots.length;

    addCarouselLog('info', `Tentativa de exportação: ${uniqueSlotIds.size} slots no carrossel, ${emptySlotsCount} pendentes`, {
      emptySlotIds: emptySlots
    });

    if (emptySlotsCount > 0) {
      setDialogConfig({
        isOpen: true,
        type: 'confirm',
        title: 'Fotos Pendentes',
        message: `Atenção: Existem ${emptySlotsCount} ${emptySlotsCount === 1 ? 'foto não carregada' : 'fotos não carregadas'} no carrossel. Deseja exportar assim mesmo?`,
        confirmLabel: 'Exportar Mesmo Assim',
        cancelLabel: 'Voltar e Preencher',
        onConfirm: () => {
          setDialogConfig((prev) => ({ ...prev, isOpen: false }));
          executeExport();
        },
        onCancel: () => setDialogConfig((prev) => ({ ...prev, isOpen: false }))
      });
      return;
    }

    await executeExport();
  };

  const activeSlide = currentTemplate.slides[currentSlideIndex];
  const activeSlotDefinition = activeSlide?.slots.find((s) => s.id === activeSlotId) || activeSlide?.slots[0];
  const activeSlotData = activeSlotId ? slotsData[activeSlotId] : undefined;

  return (
    <div className="h-[100dvh] bg-[#0A0D14] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="fixed -top-96 -left-96 w-1 h-1 opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Header Limpo com Janela Home e Salvar Projeto */}
      <header className="h-14 border-b border-slate-800 bg-[#10141E] px-3 sm:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão Janela Home */}
          <button
            onClick={() => setIsHomeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:border-amber-500/50 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Abrir Templates e Projetos"
          >
            <Home className="w-4 h-4 text-amber-500" />
            <span className="font-bold">Home</span>
          </button>

          {/* Botão Auto (Preenchimento Rápido no Editor) */}
          <button
            onClick={() => setIsAutoFillEditorOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Auto-preenchimento: carregar todas as fotos deste template de uma vez"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-xs">Auto</span>
          </button>

          {/* Botão Logs de Diagnóstico (iPhone / Debug) */}
          <button
            onClick={() => setIsLogsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-amber-500/50 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Ver logs silenciosos de erros e exportação no iPhone"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-xs text-slate-200">Logs</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Status / Botão Salvar Projeto */}
          <button
            onClick={handleSaveCurrentProject}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg active:scale-95 transition-all"
            title="Salvar Projeto Manualmente (Salvo automaticamente em segundo plano)"
          >
            {isSavedFeedback ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Save className="w-4 h-4 text-slate-400 hover:text-amber-400" />
            )}
          </button>

          <button
            onClick={handleResetAll}
            className="p-2 text-slate-400 hover:text-white rounded-lg active:bg-slate-800"
            title="Limpar fotos e ajustes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`px-3 sm:px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all ${
              isExporting ? 'opacity-50' : ''
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Salvando...' : 'Exportar Lâminas'}</span>
          </button>
        </div>
      </header>

      {/* Barra Fixa Superior com todas as fotos do carrossel */}
      {currentTemplate.slides.length > 0 && (
        <div className="bg-[#0D111A] border-b border-slate-800/80 w-full z-20 shrink-0">
          <SlideSlotsChecklist
            slides={currentTemplate.slides}
            currentSlideIndex={currentSlideIndex}
            slotsData={slotsData}
            activeSlotId={activeSlotId}
            onSelectSlot={(id, slideIdx) => {
              setActiveSlotId(id);
              if (typeof slideIdx === 'number' && slideIdx !== currentSlideIndex) {
                const belongsToCurrent = activeSlide?.slots.some((s) => s.id === id);
                if (!belongsToCurrent) {
                  setCurrentSlideIndex(slideIdx);
                }
              }
              triggerActivity();
            }}
            onPickImage={handleTriggerPickImage}
          />
        </div>
      )}

      {/* Overlay de Progresso */}
      {isExporting && exportProgress && (
        <div className="bg-amber-950/95 border-b border-amber-800 text-amber-200 px-4 py-2 text-xs flex items-center justify-between z-30 shrink-0 animate-pulse">
          <span>
            Baixando foto <strong>{exportProgress.slide}</strong> de {exportProgress.total}...
          </span>
          <span className="font-mono font-bold">
            {Math.round((exportProgress.current / exportProgress.total) * 100)}%
          </span>
        </div>
      )}

      {/* Conteúdo Central: Viewport com Slide + Painel Desktop Lateral */}
      <div className="flex-1 flex overflow-hidden">
        {/* Viewport Central */}
        <main
          onTouchStart={handleCanvasTouchStart}
          onTouchEnd={handleCanvasTouchEnd}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleDrop}
          className="flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-5 bg-[#07090E]"
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ containerType: 'size' }}
          >
            {activeSlide ? (
              <SlideView
                slide={activeSlide}
                aspectRatio={aspectRatio}
                slotsData={slotsData}
                activeSlotId={activeSlotId}
                onSelectSlot={(id) => {
                  setActiveSlotId(id);
                  triggerActivity();
                }}
                onUpdateAdjustments={handleUpdateAdjustments}
                onPickImage={handleTriggerPickImage}
              />
            ) : (
              /* Estado Inicial de Projeto em Branco */
              <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm">
                <button
                  onClick={() => setIsSlidePickerOpen(true)}
                  className="w-20 h-20 rounded-2xl bg-amber-600/20 border-2 border-dashed border-amber-500/60 hover:border-amber-500 hover:bg-amber-600/30 text-amber-400 flex items-center justify-center shadow-lg transition-all active:scale-95 group mb-4 cursor-pointer"
                >
                  <Plus className="w-10 h-10 group-hover:scale-110 transition-transform stroke-[2.5]" />
                </button>
                <h3 className="font-bold text-base text-slate-100">Adicione sua 1ª Lâmina</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Toque no botão acima para abrir a grade e escolher a primeira lâmina do seu carrossel personalizado.
                </p>
              </div>
            )}
          </div>

          {/* Lâminas em background em resolução nativa 1080p para exportação limpa */}
          <div
            aria-hidden="true"
            className="fixed pointer-events-none"
            style={{
              position: 'fixed',
              left: '-99999px',
              top: 0,
              width: `${ASPECT_RATIOS[aspectRatio].width}px`,
              height: `${ASPECT_RATIOS[aspectRatio].height}px`,
              opacity: 1,
              pointerEvents: 'none',
              zIndex: -50
            }}
          >
            {currentTemplate.slides.map((slide) => (
              <div
                key={`export-${slide.id}`}
                style={{
                  width: `${ASPECT_RATIOS[aspectRatio].width}px`,
                  height: `${ASPECT_RATIOS[aspectRatio].height}px`
                }}
              >
                <SlideView
                  slide={slide}
                  aspectRatio={aspectRatio}
                  slotsData={slotsData}
                  isExport={true}
                  onSelectSlot={() => {}}
                  onUpdateAdjustments={() => {}}
                  onPickImage={() => {}}
                  innerRef={(el) => {
                    if (el) slideRefs.current[slide.id] = el;
                  }}
                />
              </div>
            ))}
          </div>
        </main>

        {/* Controles de Sliders para Desktop (Ocultos em telas mobile) */}
        <div className="hidden md:flex">
          {activeSlotDefinition && activeSlotData && (
            <DesktopControlsPanel
              activeSlot={activeSlotDefinition}
              data={activeSlotData}
              onChange={handleSlotDataChange}
              onPickImage={() => handleTriggerPickImage(activeSlotDefinition.id)}
            />
          )}
        </div>
      </div>

      {/* Barra Inferior de Navegação */}
      <footer
        className="bg-[#10141E] border-t border-slate-800/80 px-3 sm:px-4 py-2 flex flex-col gap-1.5 shrink-0 z-20 pb-safe-bottom"
        style={{
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 14px))'
        }}
      >
        {/* Painel Contextual de Ajuste da Foto (Apenas Mobile - No Desktop já existe o painel lateral) */}
        {/* Altura pré-reservada fixa (h-12) para que a lâmina nunca mude de tamanho/posição quando os controles aparecem/somem */}
        <div className="md:hidden h-12 w-full flex items-center relative">
          {activeSlotDefinition && (
            <div
              className={`w-full transition-opacity duration-300 ease-out ${
                isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-xl flex items-center justify-between gap-3">
                {/* Botão Adicionar ou Trocar Foto */}
                <button
                  onClick={() => handleTriggerPickImage(activeSlotDefinition.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-sm transition-colors cursor-pointer"
                  title={activeSlotData?.imageUrl ? 'Trocar Foto' : 'Adicionar Foto'}
                >
                  {activeSlotData?.imageUrl ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Trocar</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Foto</span>
                    </>
                  )}
                </button>

                {/* Slider de Zoom Completo (Largo e Desobstruído) */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 shrink-0">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden xs:inline">ZOOM</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="400"
                    step="1"
                    disabled={!activeSlotData?.imageUrl}
                    value={activeSlotData?.adjustments.zoom ?? 100}
                    onChange={(e) => {
                      const newZoom = Number(e.target.value);
                      const currentAdj = activeSlotData?.adjustments || { zoom: 100, x: 50, y: 50 };
                      handleUpdateAdjustments(activeSlotDefinition.id, {
                        ...currentAdj,
                        zoom: newZoom
                      });
                    }}
                    className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
                  />
                  <span className="text-[10px] font-mono text-slate-300 w-8 text-right shrink-0 mr-1">
                    {activeSlotData?.adjustments.zoom ?? 100}%
                  </span>
                </div>

                {/* Botão Resetar Ajustes do Slot */}
                <button
                  onClick={() => {
                    handleUpdateAdjustments(activeSlotDefinition.id, {
                      zoom: 100,
                      x: 50,
                      y: 50
                    });
                  }}
                  disabled={!activeSlotData?.imageUrl}
                  className="p-1.5 text-slate-400 hover:text-white active:bg-slate-800 disabled:opacity-30 rounded-lg transition-colors shrink-0 cursor-pointer"
                  title="Resetar Zoom e Posição"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Indicador de Lâmina e Seletor */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          <button
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20 active:bg-slate-700 shrink-0 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Lâmina anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={slideNavContainerRef}
            className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto px-1 py-1.5 scroll-smooth no-scrollbar"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {currentTemplate.slides.map((s, idx) => (
              <div key={s.id} className="relative shrink-0">
                <button
                  ref={(el) => {
                    slideButtonRefs.current[idx] = el;
                  }}
                  onClick={() => goToSlide(idx)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    currentSlideIndex === idx
                      ? 'bg-amber-600 text-white shadow-lg scale-105 ring-2 ring-amber-400/50'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 active:bg-slate-700'
                  }`}
                  title={`Ir para lâmina #${idx + 1}`}
                >
                  {idx + 1}
                </button>

                {/* Botão de Excluir Lâmina (Aparece ao passar o mouse ou lâmina ativa com mais de 1 lâmina no total) */}
                {currentTemplate.slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCurrentSlide(idx);
                    }}
                    className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-opacity shadow-sm z-30 cursor-pointer ${
                      currentSlideIndex === idx ? 'opacity-90 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title={`Excluir Lâmina #${idx + 1}`}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}

            {/* Botão + no contador para chamar a grade de lâminas disponíveis */}
            <button
              ref={(el) => {
                slideButtonRefs.current[currentTemplate.slides.length] = el;
              }}
              onClick={() => setIsSlidePickerOpen(true)}
              className="w-9 h-9 rounded-xl border border-dashed border-amber-500/70 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
              title="Adicionar Lâmina ao Carrossel"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <button
            onClick={goToNextSlide}
            disabled={currentSlideIndex >= currentTemplate.slides.length - 1}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20 active:bg-slate-700 shrink-0 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Próxima lâmina"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* Janela Modal Home (Templates Fixos e Projetos Salvos) */}
      <HomeModal
        isOpen={isHomeOpen}
        onClose={() => setIsHomeOpen(false)}
        templates={AVAILABLE_TEMPLATES}
        projects={savedProjects}
        currentProjectId={currentProjectId}
        onSelectTemplate={handleSelectTemplate}
        onSelectTemplateWithPhotos={handleSelectTemplateWithPhotos}
        onCreateCustomTemplate={handleCreateCustomTemplate}
        onOpenProject={handleOpenProject}
        onDeleteProject={handleDeleteProject}
        onApplyRandomProject={handleApplyRandomProject}
        onOpenLogs={() => setIsLogsOpen(true)}
      />

      {/* Modal Grade de Lâminas Disponíveis */}
      <SlidePickerModal
        isOpen={isSlidePickerOpen}
        onClose={() => setIsSlidePickerOpen(false)}
        onPickSlide={handleAddSlideFromCatalog}
        currentTemplateId={currentTemplate.id}
        currentTemplateName={currentTemplate.name}
      />

      {/* Modal de Auto-Preenchimento Rápido dentro do Editor */}
      <AutoFillModal
        isOpen={isAutoFillEditorOpen}
        template={currentTemplate}
        onClose={() => setIsAutoFillEditorOpen(false)}
        onApply={(updatedData) => {
          setSlotsData(updatedData);
          for (const [slotId, data] of Object.entries(updatedData)) {
            saveSlotData(slotId, data.imageUrl, data.adjustments);
          }
          triggerAutoSaveProject(updatedData);
          addCarouselLog(
            'info',
            `Auto-preenchimento aplicado com sucesso no template "${currentTemplate.name}".`
          );
          setIsAutoFillEditorOpen(false);
        }}
      />

      {/* Diálogo Interno do Sistema (Substitui confirm/alert do navegador) */}
      <InternalDialogModal config={dialogConfig} />

      {/* Modal de Logs Silenciosos (iPhone / Depuração) */}
      <ExportResultModal
        isOpen={Boolean(exportResults && exportResults.length > 0)}
        onClose={() => setExportResults(null)}
        results={exportResults || []}
      />

      <CarouselLogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />
    </div>
  );
}
