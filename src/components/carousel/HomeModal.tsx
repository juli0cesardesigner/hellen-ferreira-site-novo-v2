'use client';

import React, { useState } from 'react';
import { CarouselTemplate, CarouselProject } from '@/lib/carousel/types';
import { LayoutTemplate, FolderGit2, Plus, Trash2, ArrowRight, Clock, Image as ImageIcon } from 'lucide-react';
import { InternalDialogModal, InternalModalConfig } from './InternalDialogModal';

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
  onDeleteProject
}: HomeModalProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'projects'>('templates');
  const [dialogConfig, setDialogConfig] = useState<InternalModalConfig>({
    isOpen: false,
    message: '',
    onConfirm: () => {}
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0D14] text-slate-100 animate-in fade-in duration-200">
      <div className="w-full h-full flex flex-col overflow-hidden max-w-4xl mx-auto">
        {/* Header da Janela Home Tela Cheia */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-2xl text-amber-500 tracking-tight">Carrossel</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">Studio</span>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors shadow-sm"
          >
            Voltar ao Editor
          </button>
        </div>

        {/* Abas: Templates vs Projetos */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('templates')}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                activeTab === 'templates' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Templates</span>
              {activeTab === 'templates' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                activeTab === 'projects' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Projetos</span>
              {activeTab === 'projects' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t" />
              )}
            </button>
          </div>

          {/* Botão + Criar Template Personalizado em Branco */}
          <button
            onClick={onCreateCustomTemplate}
            className="mb-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Criar carrossel em branco e escolher lâminas"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Personalizado</span>
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'templates' ? (
            <div className="flex flex-col gap-6">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header do Card do Template */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {tpl.slides.length} Lâminas
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectTemplate(tpl)}
                        className="py-2 px-3.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Usar Template</span>
                      </button>
                    </div>

                    {/* Prévia do Carrossel: Thumbs lado a lado na proporção 4:5 conectadas */}
                    <div className="bg-[#05070B] border border-slate-800/80 rounded-xl p-3 sm:p-4 overflow-x-auto">
                      <div className="flex items-center gap-2 min-w-max">
                        {tpl.slides.map((slide, sIdx) => (
                          <div key={slide.id} className="w-28 sm:w-36 aspect-[4/5] bg-white rounded-md overflow-hidden shadow-md border border-slate-700/60 relative">
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
                            {/* Overlay com número da lâmina */}
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
                <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                  <FolderGit2 className="w-12 h-12 text-slate-600 stroke-[1.5] mb-3" />
                  <p className="text-sm font-semibold text-slate-300">Nenhum projeto salvo ainda</p>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Ao editar suas lâminas e adicionar fotos, clique em "Salvar Projeto" para guardá-lo e continuar mais tarde.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((proj) => {
                    const isCurrent = proj.id === currentProjectId;
                    const dateFormatted = new Date(proj.updatedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={proj.id}
                        className={`bg-slate-900/80 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                          isCurrent
                            ? 'border-amber-500 shadow-lg shadow-amber-500/10'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {dateFormatted}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                                Em Aberto
                              </span>
                            )}
                          </div>

                          {/* Miniatura ou Placeholder */}
                          <div className="w-full h-24 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden mb-3">
                            {proj.coverThumbnail ? (
                              <img
                                src={proj.coverThumbnail}
                                alt={proj.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center text-slate-600 gap-1">
                                <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                                <span className="text-[10px]">Sem fotos</span>
                              </div>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-slate-100 truncate">
                            {proj.name}
                          </h3>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() => onOpenProject(proj)}
                            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <span>Abrir</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDialogConfig({
                                isOpen: true,
                                type: 'confirm',
                                title: 'Excluir Projeto',
                                message: `Deseja realmente excluir o projeto "${proj.name}"?`,
                                confirmLabel: 'Excluir',
                                onConfirm: () => {
                                  onDeleteProject(proj.id);
                                  setDialogConfig((prev) => ({ ...prev, isOpen: false }));
                                },
                                onCancel: () => {
                                  setDialogConfig((prev) => ({ ...prev, isOpen: false }));
                                }
                              });
                            }}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Excluir Projeto"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Diálogo Interno no mesmo padrão visual do sistema */}
      <InternalDialogModal config={dialogConfig} />
    </div>
  );
}

