import { supabase } from '@/src/lib/supabaseClient';

/**
 * Image Compression Utility
 * Resizes and compresses uploaded images/photos on the client-side before saving.
 * Downscales images to max 800x800px JPEG at 70% quality (~40KB - 80KB size).
 */
export function compressImage(
  file: File, 
  maxWidth = 800, 
  maxHeight = 800, 
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('הקובץ שנבחר אינו תמונה תקופתית'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          resolve(event.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}

/**
 * Compress File to Blob for Storage Upload
 */
export function compressImageToBlob(
  file: File, 
  maxWidth = 800, 
  maxHeight = 800, 
  quality = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('הקובץ שנבחר אינו תמונה תקופתית'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          reject(new Error('Canvas context failed'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create Blob from canvas'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}

/**
 * Upload Image to Supabase Storage Bucket ('recipe-images')
 * Returns Public CDN URL for storage, or fallback to compressed Data URL
 */
export async function uploadRecipeImageToSupabase(file: File): Promise<string> {
  const hasSupabaseEnv =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Compress image client-side first (~40KB - 80KB)
  const compressedBlob = await compressImageToBlob(file);

  if (!hasSupabaseEnv) {
    // Fallback to local Data URL if Supabase env is missing
    return await compressImage(file);
  }

  try {
    const fileName = `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;

    // Upload to 'recipe-images' Public Bucket
    const { data, error } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, compressedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase bucket upload failed, using compressed base64 fallback:', error);
      return await compressImage(file);
    }

    // Retrieve Public CDN URL
    const { data: publicUrlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Supabase storage exception, using compressed base64 fallback:', err);
    return await compressImage(file);
  }
}

/**
 * Upload Planner Day Photo to Supabase Storage Bucket ('planner-photos')
 * Returns Public CDN URL for storage, or fallback to compressed Data URL
 */
export async function uploadPlannerPhotoToSupabase(file: File): Promise<string> {
  const hasSupabaseEnv =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const compressedBlob = await compressImageToBlob(file);

  if (!hasSupabaseEnv) {
    return await compressImage(file);
  }

  try {
    const fileName = `planner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;

    const { data, error } = await supabase.storage
      .from('planner-photos')
      .upload(fileName, compressedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase planner-photos upload failed, using base64 fallback:', error);
      return await compressImage(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from('planner-photos')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Supabase planner-photos exception, using base64 fallback:', err);
    return await compressImage(file);
  }
}
