import { supabase, isSupabaseConfigured } from './supabase';

export interface CompressedImageResult {
  blob: Blob;
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: number;
}

/**
 * Compresses an image file using browser Canvas API before uploading.
 * Reduces file sizes from 3-5MB down to ~120-200KB while preserving HD sharpness.
 */
export const compressImage = (
  file: File,
  maxWidth = 1280,
  maxHeight = 960,
  quality = 0.82
): Promise<CompressedImageResult> => {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG dataUrl & Blob
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Blob generation failed'));
              return;
            }
            const compressedSizeKb = Math.round(blob.size / 1024);
            const compressionRatio = Math.round((1 - compressedSizeKb / originalSizeKb) * 100);

            resolve({
              blob,
              dataUrl,
              originalSizeKb,
              compressedSizeKb,
              compressionRatio: Math.max(0, compressionRatio)
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Erro ao processar imagem para compressão'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem'));
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a single property photo.
 * Compresses first, attempts Supabase Storage, and falls back to compressed Base64.
 */
export const uploadPropertyPhoto = async (
  file: File,
  propertyId: string = 'prop'
): Promise<string> => {
  try {
    const compressed = await compressImage(file);

    if (isSupabaseConfigured()) {
      try {
        const fileExt = 'jpg';
        const fileName = `${propertyId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `properties/${fileName}`;

        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(filePath, compressed.blob, {
            contentType: 'image/jpeg',
            cacheControl: '31536000',
            upsert: true
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn('Supabase Storage indisponível, usando fallback Base64 otimizado:', storageErr);
      }
    }

    // High-performance fallback: compressed dataUrl
    return compressed.dataUrl;
  } catch (err) {
    console.error('Erro no upload da foto:', err);
    throw err;
  }
};
