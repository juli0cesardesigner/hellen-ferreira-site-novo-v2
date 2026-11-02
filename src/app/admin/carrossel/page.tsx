'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_TEMPLATES } from '@/lib/carousel/templates';
import { CarouselTemplate, AspectRatio, ASPECT_RATIOS, PhotoSlotData, PhotoSlotAdjustment, CarouselProject } from '@/lib/carousel/types';
import { SlideView } from '@/components/carousel/SlideView';
import { DesktopControlsPanel } from '@/components/carousel/DesktopControlsPanel';
import { HomeModal } from '@/components/carousel/HomeModal';
import { SlidePickerModal } from '@/components/carousel/SlidePickerModal';
import { InternalDialogModal, InternalModalConfig } from '@/components/carousel/InternalDialogModal';
import { CatalogSlideItem, CATALOG_SLIDES } from '@/lib/carousel/templates/catalog';
import { exportSlidesSequentially } from '@/lib/carousel/exporter';
import { loadAllSlotData, saveSlotData, clearAllSlotData, saveProject, loadAllProjects, deleteProject } from '@/lib/carousel/storage';
import { Download, RefreshCw, ChevronLeft, ChevronRight, Plus, RotateCcw, ZoomIn, Home, Save, Check, Trash2 } from 'lucide-react';

export default function CarouselStudioPage() {
  const [currentTemplate, setCurrentTemplate] = useState<CarouselTemplate>(AVAILABLE_TEMPLATES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [activeSlotId, setActiveSlotId] = useState<string>('');
  const [slotsData, setSlotsData] = useState<Record<string, PhotoSlotData>>({});
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number; slide: number } | null>(null);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);

  // Estados de Home e Projetos
  const [isHomeOpen, setIsHomeOpen] = useState<boolean>(true);
  const [isSlidePickerOpen, setIsSlidePickerOpen] = useState<boolean>(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSlotPickRef = useRef<string>('');
  const slideRefs = useRef<Record<string, HTMLElement>>({});

  // Carrega estado persistido e lista de projetos do IndexedDB
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
  }, [currentTemplate]);

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
    setIsHomeOpen(false);
  };

  // Criação de Template / Projeto Personalizado em Branco
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
    setIsHomeOpen(false);
  };

  // Execução direta da inserção de lâminas no carrossel
  const applyAddSlides = (itemsToAdd: CatalogSlideItem[]) => {
    let updatedSlides = [...currentTemplate.slides];
    const newSlotsDataMap: Record<string, PhotoSlotData> = { ...slotsData };
    let firstNewSlotId = '';

    for (const item of itemsToAdd) {
      const nextNumber = updatedSlides.length + 1;
      const uniqueSlideId = `custom_slide_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      // Gera IDs únicos para TODOS os slots da nova lâmina para nunca reaproveitar fotos antigas
      const newSlots = item.slideDefinition.slots.map((s, idx) => ({
        ...s,
        id: `${uniqueSlideId}_slot_${idx}`
      }));

      const newSlideDefinition = {
        ...item.slideDefinition,
        id: uniqueSlideId,
        slideNumber: nextNumber,
        slots: newSlots
      };

      updatedSlides.push(newSlideDefinition);

      // Sempre inicializa a lâmina em branco (sem herdar fotos anteriores)
      for (const slot of newSlots) {
        newSlotsDataMap[slot.id] = {
          id: slot.id,
          label: slot.label,
          imageUrl: undefined,
          adjustments: { zoom: 100, x: 50, y: 50 }
        };
        saveSlotData(slot.id, undefined, { zoom: 100, x: 50, y: 50 });
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

    setIsSlidePickerOpen(false);
  };

  // Inserção de lâmina(s) da grade no template ativo com diálogo interno
  const handleAddSlideFromCatalog = (catalogItem: CatalogSlideItem) => {
    // Se for lâmina com foto sobreposta contínua (seamless), pergunta de forma direta se quer incluir a lâmina par
    if (catalogItem.seamlessPairId) {
      const isL3 = catalogItem.slideDefinition.id === 't2-slide-3';
      const promptMsg = isL3
        ? 'Esta lâmina possui uma foto contínua (seamless). Deseja inserir também a próxima lâmina para completar a foto?'
        : 'Esta lâmina é continuação de uma foto (seamless). Deseja inserir também a lâmina anterior para completar a foto?';

      setDialogConfig({
        isOpen: true,
        type: 'confirm',
        title: 'Foto Contínua (Seamless)',
        message: promptMsg,
        confirmLabel: 'Sim, inserir ambas',
        cancelLabel: 'Apenas esta',
        onConfirm: () => {
          setDialogConfig((prev) => ({ ...prev, isOpen: false }));
          const pairItem = CATALOG_SLIDES.find((c) => c.id === catalogItem.seamlessPairId);
          const items = pairItem ? (isL3 ? [catalogItem, pairItem] : [pairItem, catalogItem]) : [catalogItem];
          applyAddSlides(items);
        },
        onCancel: () => {
          setDialogConfig((prev) => ({ ...prev, isOpen: false }));
          applyAddSlides([catalogItem]);
        }
      });
      return;
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
      setSlotsData((prev) => {
        const existing = prev[targetSlotId] || {
          id: targetSlotId,
          label: '',
          adjustments: { zoom: 100, x: 50, y: 50 }
        };
        const updated = {
          ...existing,
          imageUrl: result,
          adjustments: { zoom: 100, x: 50, y: 50 }
        };
        saveSlotData(targetSlotId, result, updated.adjustments);
        const newMap = { ...prev, [targetSlotId]: updated };
        triggerAutoSaveProject(newMap);
        return newMap;
      });
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
      },
      onCancel: () => setDialogConfig((prev) => ({ ...prev, isOpen: false }))
    });
  };

  const handleExport = async () => {
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

      await exportSlidesSequentially(itemsToExport, aspectRatio, (curr, tot, sNum) => {
        setExportProgress({ current: curr, total: tot, slide: sNum });
      });
    } catch (err) {
      console.error('Falha na exportação:', err);
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
        className="hidden"
      />

      {/* Header Limpo com Janela Home e Salvar Projeto */}
      <header className="h-14 border-b border-slate-800 bg-[#10141E] px-3 sm:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão Janela Home */}
          <button
            onClick={() => setIsHomeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:border-amber-500/50 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Abrir Templates e Projetos"
          >
            <Home className="w-4 h-4 text-amber-500" />
            <span className="font-bold">Home</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Status / Botão Salvar Projeto */}
          <button
            onClick={handleSaveCurrentProject}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isSavedFeedback
                ? 'bg-emerald-600/30 border-emerald-500/80 text-emerald-300'
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Salvo automaticamente a cada alteração"
          >
            {isSavedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono">Salvo auto</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xs:inline">Salvar</span>
              </>
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
        <main className="flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-5 bg-[#07090E]">
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
            className="fixed pointer-events-none opacity-0"
            style={{
              left: '-99999px',
              top: '-99999px',
              width: `${ASPECT_RATIOS[aspectRatio].width}px`,
              height: `${ASPECT_RATIOS[aspectRatio].height}px`,
              zIndex: -9999
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
      <footer className="bg-[#10141E] border-t border-slate-800/80 px-4 py-2 flex flex-col gap-2 shrink-0 z-20 pb-safe">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-sm transition-colors"
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
                  className="p-1.5 text-slate-400 hover:text-white active:bg-slate-800 disabled:opacity-30 rounded-lg transition-colors shrink-0"
                  title="Resetar Zoom e Posição"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Seletor de Lâminas */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              const prev = Math.max(0, currentSlideIndex - 1);
              setCurrentSlideIndex(prev);
              if (currentTemplate.slides[prev]?.slots[0]) {
                setActiveSlotId(currentTemplate.slides[prev].slots[0].id);
              }
            }}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 active:bg-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {currentTemplate.slides.map((s, idx) => (
              <div key={s.id} className="relative group">
                <button
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    if (s.slots[0]) setActiveSlotId(s.slots[0].id);
                  }}
                  className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                    currentSlideIndex === idx
                      ? 'bg-amber-600 text-white shadow-lg scale-105 ring-2 ring-amber-400/50'
                      : 'bg-slate-800/80 text-slate-400 active:bg-slate-700'
                  }`}
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
                    className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-opacity shadow-sm z-30 ${
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
              onClick={() => setIsSlidePickerOpen(true)}
              className="w-9 h-9 rounded-lg border border-dashed border-amber-500/70 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0"
              title="Adicionar Lâmina ao Carrossel"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <button
            onClick={() => {
              const next = Math.min(currentTemplate.slides.length - 1, currentSlideIndex + 1);
              setCurrentSlideIndex(next);
              if (currentTemplate.slides[next]?.slots[0]) {
                setActiveSlotId(currentTemplate.slides[next].slots[0].id);
              }
            }}
            disabled={currentSlideIndex === currentTemplate.slides.length - 1}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 active:bg-slate-700"
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
        onCreateCustomTemplate={handleCreateCustomTemplate}
        onOpenProject={handleOpenProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Modal Grade de Lâminas Disponíveis */}
      <SlidePickerModal
        isOpen={isSlidePickerOpen}
        onClose={() => setIsSlidePickerOpen(false)}
        onPickSlide={handleAddSlideFromCatalog}
      />

      {/* Diálogo Interno do Sistema (Substitui confirm/alert do navegador) */}
      <InternalDialogModal config={dialogConfig} />
    </div>
  );
}
