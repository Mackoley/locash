import React, { useState, useRef } from 'react';
import { Upload, X, Star, Loader2, ImagePlus, CheckCircle2 } from 'lucide-react';
import { uploadPropertyPhoto, compressImage } from '../../services/imageUploadService';

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

  const handleRemovePhoto = (indexToRemove: number) => {
    if (images.length <= 1) {
      alert('O imóvel precisa ter pelo menos 1 foto no anúncio.');
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <span>Galeria de Fotos ({images.length})</span>
          </label>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            A primeira foto é a capa principal do anúncio.
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

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {images.map((imgUrl, index) => {
          const isPrimary = index === 0;
          return (
            <div
              key={`${imgUrl.substring(0, 30)}-${index}`}
              className={`relative aspect-video rounded-xl overflow-hidden border group bg-slate-900 transition-all ${
                isPrimary 
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_15px_rgba(0,242,254,0.2)]' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Primary Badge */}
              {isPrimary && (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-black text-[9px] font-mono shadow-sm flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>CAPA</span>
                </div>
              )}

              {/* Overlay Actions on Hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-bold shadow transition-transform active:scale-90"
                    title="Definir como foto de capa"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold shadow transition-transform active:scale-90"
                  title="Excluir foto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
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
