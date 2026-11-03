'use client';

import React, { useState } from 'react';
import { CarouselTemplate, CarouselProject, PhotoSlotData } from '@/lib/carousel/types';
import { Plus, Trash2, Clock, Image as ImageIcon } from 'lucide-react';
import { InternalDialogModal, InternalModalConfig } from './InternalDialogModal';
import { RandomizerModal } from './RandomizerModal';

interface HomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: CarouselTemplate[];
  projects: CarouselProject[];
  currentProjectId?: string;
  onSelectTemplate: (template: CarouselTemplate) => void;
  onCreateCustomTemplate: () => void;
  onOpenProject: (project: CarouselProject) => void;
  onDeleteProject: (projectId: string) => void;
  onApplyRandomProject: (template: CarouselTemplate, slotsData: Record<string, PhotoSlotData>) => void;
}

export function HomeModal({
  isOpen,
  onClose,
  templates,
  projects,
  currentProjectId,
  onSelectTemplate,
  onCreateCustomTemplate,
  onOpenProject,
  onDeleteProject,
  onApplyRandomProject
}: HomeModalProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'projects'>('templates');
  const [isRandomizerOpen, setIsRandomizerOpen] = useState<boolean>(false);
  const [dialogConfig, setDialogConfig] = useState<InternalModalConfig>({
    isOpen: false,
    message: '',
    onConfirm: () => {}
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0D14] text-slate-100 animate-in fade-in duration-200">
        <div className="w-full h-full flex flex-col overflow-hidden max-w-4xl mx-auto">
          {/* Header Superior: APENAS Personalizado | Aleatório | Editor */}
          <div className="p-3.5 sm:p-5 border-b border-slate-800/90 bg-[#0F1420]/80 backdrop-blur-md flex items-center justify-center shrink-0">
            <div className="w-full max-w-sm flex items-center justify-between gap-2.5">
              <button
                onClick={onCreateCustomTemplate}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold rounded-xl text-center shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Criar carrossel em branco e escolher lâminas"
              >
                Personalizado
              </button>

              <button
                onClick={() => setIsRandomizerOpen(true)}
                className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl text-center shadow-md shadow-amber-500/10 transition-all active:scale-95 cursor-pointer"
                title="Criar carrossel com distribuição aleatória"
              >
                Aleatório
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold rounded-xl text-center transition-all cursor-pointer"
                title="Voltar ao Editor"
              >
                Editor
              </button>
            </div>
          </div>

          {/* Conteúdo Central Rolável */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20">
            {activeTab === 'templates' ? (
              <div className="flex flex-col gap-6">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-amber-500/5"
                  >
                    <div className="flex flex-col gap-3 sm:gap-4">
                      {/* Header do Card do Template */}
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {tpl.slides.length} Lâminas
                          </span>
                        </div>

                        <button
                          onClick={() => onSelectTemplate(tpl)}
                          className="py-1.5 sm:py-2 px-3.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Usar Template</span>
                        </button>
                      </div>

                      {/* Prévia do Carrossel */}
                      <div className="bg-[#05070B] border border-slate-800/80 rounded-xl p-3 sm:p-4 overflow-x-auto">
                        <div className="flex items-center gap-2 min-w-max">
                          {tpl.slides.map((slide, sIdx) => (
                            <div key={slide.id} className="w-24 sm:w-36 aspect-[4/5] bg-white rounded-md overflow-hidden shadow-md border border-slate-700/60 relative">
                              {slide.thumbnailSvg ? (
                                <img
                                  src={slide.thumbnailSvg}
                                  alt={`Lâmina ${sIdx + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-mono">
                                  Lâmina {sIdx + 1}
                                </div>
                              )}
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white font-mono text-[9px] px-1 rounded backdrop-blur-xs">
                                #{sIdx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {projects.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                    <p className="text-sm font-semibold text-slate-300">Nenhum projeto salvo ainda</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Ao editar suas lâminas e adicionar fotos, clique em "Salvar Projeto" para guardá-lo e continuar mais tarde.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {projects.map((proj) => {
                      const dateStr = new Date(proj.updatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      const isCurrent = currentProjectId === proj.id;

                      return (
                        <div
                          key={proj.id}
                          onClick={() => onOpenProject(proj)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                            isCurrent
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-semibold text-sm text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                                {proj.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono shrink-0">
                                  Ativo
                                </span>
                              )}
                            </div>

                            {/* Thumbnail da Capa */}
                            <div className="aspect-[4/5] w-full rounded-lg bg-slate-950 overflow-hidden mb-3 border border-slate-800/80 flex items-center justify-center">
                              {proj.coverThumbnail ? (
                                <img
                                  src={proj.coverThumbnail}
                                  alt="Capa do Carrossel"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-slate-700" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                            <span className="flex items-center gap-1 text-[11px] font-mono">
                              <Clock className="w-3 h-3" />
                              {dateStr}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDialogConfig({
                                  isOpen: true,
                                  type: 'confirm',
                                  title: 'Excluir Projeto',
                                  message: `Tem certeza que deseja excluir "${proj.name}"? Esta ação não pode ser desfeita.`,
                                  confirmLabel: 'Excluir',
                                  cancelLabel: 'Cancelar',
                                  onConfirm: () => {
                                    setDialogConfig((prev) => ({ ...prev, isOpen: false }));
                                    onDeleteProject(proj.id);
                                  },
                                  onCancel: () => setDialogConfig((prev) => ({ ...prev, isOpen: false }))
                                });
                              }}
                              className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                              title="Excluir projeto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menu Fixo no Bottom (Tabs: Templates & Projetos) */}
          <div className="border-t border-slate-800/90 bg-[#0F1420]/95 backdrop-blur-md px-6 py-3 flex items-center justify-around shrink-0 z-20">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                activeTab === 'templates'
                  ? 'text-amber-400 font-bold bg-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <span className="text-sm">Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                activeTab === 'projects'
                  ? 'text-amber-400 font-bold bg-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <span className="text-sm">Projetos</span>
            </button>
          </div>
        </div>
      </div>

      <InternalDialogModal config={dialogConfig} />

      {/* Modal de Modo Aleatório */}
      <RandomizerModal
        isOpen={isRandomizerOpen}
        onClose={() => setIsRandomizerOpen(false)}
        onApplyRandomProject={(randomTemplate, randomSlotsData) => {
          onApplyRandomProject(randomTemplate, randomSlotsData);
          setIsRandomizerOpen(false);
          onClose();
        }}
      />
    </>
  );
}
