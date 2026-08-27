import React, { useState, useRef } from 'react';
import { Upload, X, Star, Loader2, ImagePlus, Move } from 'lucide-react';
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

  // Drag & Drop Reordering Handlers
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
            <span>Arraste qualquer foto para a 1ª posição para ser a <b>Capa</b>.</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-neon-cyan transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ImagePlus className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
          <span>{isUploading ? 'Processando...' : 'Adicionar Fotos'}</span>
        </button>

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

      {/* Drag & Drop Reorderable Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {images.map((imgUrl, index) => {
          const isPrimary = index === 0;
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={`${imgUrl.substring(0, 30)}-${index}`}
              draggable={!isUploading}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-video rounded-xl overflow-hidden border bg-slate-900 transition-all duration-200 cursor-grab active:cursor-grabbing select-none group ${
                isDragging ? 'opacity-30 scale-95 border-dashed border-cyan-400' : ''
              } ${
                isOver && !isDragging ? 'ring-2 ring-cyan-400 scale-105 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.4)] z-20' : ''
              } ${
                isPrimary && !isOver && !isDragging
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_15px_rgba(0,242,254,0.2)]' 
                  : !isOver && !isDragging ? 'border-slate-800 hover:border-slate-700' : ''
              }`}
              title="Arraste para mudar a ordem das fotos"
            >
              <img
                src={imgUrl}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Primary Cover Badge */}
              {isPrimary && (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[9px] font-mono shadow-md flex items-center gap-1 z-10">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>CAPA</span>
                </div>
              )}

              {/* Drag Handle Indicator */}
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-cyan-300 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 pointer-events-none">
                <Move className="w-2.5 h-2.5" />
                <span>#{index + 1}</span>
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
