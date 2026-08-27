import React, { useState, useRef } from 'react';
import { Upload, X, Star, Loader2, ImagePlus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { uploadPropertyPhoto } from '../../services/imageUploadService';

interface PropertyPhotoUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  propertyId?: string;
}

export const PropertyPhotoUploader: React.FC<PropertyPhotoUploaderProps> = ({
  images,
  onChange,
  propertyId = 'temp'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(`Otimizando e enviando ${files.length} foto(s)...`);

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Comprimindo foto ${i + 1} de ${files.length}...`);
        const url = await uploadPropertyPhoto(file, propertyId);
        newUrls.push(url);
      }

      onChange([...images, ...newUrls]);
    } catch (err) {
      console.error('Erro ao adicionar fotos:', err);
      alert('Erro ao carregar fotos. Tente novamente com imagens menores.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    if (images.length <= 1) {
      alert('O anúncio precisa ter pelo menos 1 foto.');
      return;
    }
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    const item = images[indexToPrimary];
    const filtered = images.filter((_, idx) => idx !== indexToPrimary);
    onChange([item, ...filtered]);
  };

  const handleMove = (e: React.MouseEvent, fromIndex: number, toIndex: number) => {
    e.stopPropagation();
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [item] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, item);
    onChange(updated);
  };

  // Drag & Drop Handlers for Desktop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...images];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    onChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <span>Galeria de Fotos ({images.length})</span>
          </label>
          <p className="text-[11px] text-cyan-400 font-sans mt-0.5 flex items-center gap-1 font-medium">
            <span>💡</span>
            <span><b>Clique em qualquer foto</b> para defini-la como Capa Principal.</span>
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadProgress && (
        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 animate-fade-in font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Thumbnails Grid with Click to Cover & Move Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {images.map((imgUrl, index) => {
          const isPrimary = index === 0;
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={`${imgUrl.substring(0, 30)}-${index}`}
              onClick={() => handleSetPrimary(index)}
              draggable={!isUploading}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-video rounded-xl overflow-hidden border bg-slate-900 transition-all duration-200 cursor-pointer select-none group ${
                isDragging ? 'opacity-40 border-dashed border-cyan-400' : ''
              } ${
                isOver && !isDragging ? 'ring-2 ring-cyan-400 scale-105 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.4)] z-20' : ''
              } ${
                isPrimary && !isOver && !isDragging
                  ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_18px_rgba(0,242,254,0.25)]' 
                  : !isOver && !isDragging ? 'border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_12px_rgba(0,242,254,0.15)]' : ''
              }`}
              title={isPrimary ? 'Foto de Capa Principal' : 'Clique para tornar esta foto a Capa'}
            >
              <img
                src={imgUrl}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
              />

              {/* Primary Cover Badge */}
              {isPrimary ? (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[9px] font-mono shadow-md flex items-center gap-1 z-10">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>CAPA</span>
                </div>
              ) : (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-slate-400 group-hover:text-cyan-300 group-hover:bg-cyan-950/80 text-[9px] font-mono transition-colors flex items-center gap-1 z-10">
                  <span>#{index + 1}</span>
                  <span className="hidden group-hover:inline font-bold">• Tornar Capa</span>
                </div>
              )}

              {/* Position Reorder Navigation Arrows */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-1 pointer-events-auto">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => handleMove(e, index, index - 1)}
                      className="p-1 rounded-md bg-black/75 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 text-[9px] transition-all cursor-pointer shadow"
                      title="Mover para a esquerda"
                    >
                      <ChevronLeft className="w-3 h-3 stroke-[3]" />
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleMove(e, index, index + 1)}
                      className="p-1 rounded-md bg-black/75 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 text-[9px] transition-all cursor-pointer shadow"
                      title="Mover para a direita"
                    >
                      <ChevronRight className="w-3 h-3 stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dedicated Top-Right Delete Button */}
              <button
                type="button"
                onClick={(e) => handleRemovePhoto(e, index)}
                className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/80 hover:bg-red-600 text-slate-300 hover:text-white transition-all transform active:scale-90 z-20 cursor-pointer shadow"
                title="Excluir foto"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          );
        })}

        {/* Add photo card button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-video rounded-xl border border-dashed border-cyan-500/30 hover:border-cyan-400 bg-slate-900/40 hover:bg-cyan-950/20 flex flex-col items-center justify-center gap-1.5 text-cyan-400/80 hover:text-cyan-300 transition-all cursor-pointer group"
        >
          <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-mono font-bold">+ Foto</span>
        </button>
      </div>
    </div>
  );
};
