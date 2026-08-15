"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Upload, Image as ImageIcon, CheckCircle2, Loader2, RefreshCw, 
  Sparkles, ShieldCheck, X, Grid, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryData {
  id: string;
  title: string;
  section: string;
  currentImage: string;
  galleryPhotos: string[];
}

export function ThumbnailManager() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [galleryModalCategory, setGalleryModalCategory] = useState<CategoryData | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchThumbnails = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/thumbnails");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Erro ao carregar thumbnails:", error);
      showNotification("Erro ao carregar as capas dos serviços", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThumbnails();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileUpload = async (category: string, file: File) => {
    try {
      setUploadingCategory(category);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/admin/thumbnails", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setCategories(prev => prev.map(cat => 
          cat.id === category ? { ...cat, currentImage: data.imagePath } : cat
        ));
        showNotification(`Capa de ${category} atualizada com sucesso!`, "success");
      } else {
        showNotification(data.error || "Erro ao fazer upload da imagem", "error");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      showNotification("Erro ao enviar arquivo", "error");
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleSelectGalleryPhoto = async (category: string, photoPath: string) => {
    try {
      setUploadingCategory(category);
      const res = await fetch("/api/admin/thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, imagePath: photoPath }),
      });
      const data = await res.json();

      if (data.success) {
        setCategories(prev => prev.map(cat => 
          cat.id === category ? { ...cat, currentImage: photoPath } : cat
        ));
        showNotification(`Foto real da galeria definida para ${category}!`, "success");
        setGalleryModalCategory(null);
      } else {
        showNotification(data.error || "Erro ao selecionar foto", "error");
      }
    } catch (error) {
      console.error("Erro ao selecionar foto da galeria:", error);
      showNotification("Erro ao atualizar thumbnail", "error");
    } finally {
      setUploadingCategory(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-sand/30 shadow-sm min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#8B5E3C] animate-spin mb-4" />
        <p className="text-stone-600 font-medium text-sm">Carregando gerenciador de capas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2C221E] via-[#3D2E28] to-[#8B5E3C] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">100% Fotos Reais do Estúdio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">Gerenciador de Capas e Thumbnails</h2>
            <p className="text-stone-300 text-sm mt-1 max-w-2xl">
              Gerencie e substitua as capas de cada categoria de ensaio. Faça upload das fotografias reais do estúdio ou selecione diretamente da galeria oficial.
            </p>
          </div>
          <button 
            onClick={fetchThumbnails}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2.5 rounded-full backdrop-blur-md transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between shadow-md text-sm ${
              notification.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="p-1 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif font-bold text-stone-800 text-lg">{cat.title}</h3>
                <span className="text-[10px] uppercase font-semibold text-[#8B5E3C] bg-stone-100 px-3 py-1 rounded-full">
                  {cat.section}
                </span>
              </div>

              {/* Image Preview Container */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 mb-4 group">
                <Image 
                  src={cat.currentImage} 
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                />
                
                {uploadingCategory === cat.id && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white text-xs gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Atualizando capa...</span>
                  </div>
                )}
                
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                  <Camera className="w-3 h-3 text-emerald-400" />
                  <span>Foto do Estúdio</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
              {/* Option 1: File Upload */}
              <label className="cursor-pointer flex items-center justify-center gap-2 bg-[#8B5E3C] hover:bg-[#724b2e] text-white text-xs font-medium py-2.5 px-4 rounded-xl transition shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Upload Foto Real</span>
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  disabled={uploadingCategory === cat.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(cat.id, file);
                  }}
                />
              </label>

              {/* Option 2: Choose from Studio Gallery */}
              {cat.galleryPhotos && cat.galleryPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setGalleryModalCategory(cat)}
                  disabled={uploadingCategory === cat.id}
                  className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium py-2.5 px-4 rounded-xl transition"
                >
                  <Grid className="w-4 h-4 text-stone-500" />
                  <span>Escolher da Galeria ({cat.galleryPhotos.length})</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gallery Selection Modal */}
      <AnimatePresence>
        {galleryModalCategory && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-800">
                    Selecione uma Foto Real para {galleryModalCategory.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Escolha uma das fotografias já publicadas no portfólio oficial do estúdio.
                  </p>
                </div>
                <button 
                  onClick={() => setGalleryModalCategory(null)}
                  className="p-2 hover:bg-stone-200 rounded-full transition text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryModalCategory.galleryPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectGalleryPhoto(galleryModalCategory.id, photo)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition group hover:ring-4 ring-[#8B5E3C]/30 ${
                      galleryModalCategory.currentImage === photo 
                        ? "border-[#8B5E3C] ring-4 ring-[#8B5E3C]/20" 
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={photo}
                      alt={`Galeria ${galleryModalCategory.title} ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      unoptimized
                    />
                    {galleryModalCategory.currentImage === photo && (
                      <div className="absolute inset-0 bg-[#8B5E3C]/40 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
                <button
                  onClick={() => setGalleryModalCategory(null)}
                  className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl transition"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
