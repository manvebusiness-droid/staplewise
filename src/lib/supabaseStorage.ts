import { supabase } from './supabase';

export class SupabaseStorageService {
  private static readonly BUCKET_NAME = 'product-images';

  /**
   * Upload a single image to Supabase Storage
   */
  static async uploadImage(file: File, userId: string): Promise<string> {
    try {
      // Validate file
      this.validateImageFile(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('🔄 Uploading image to Supabase Storage:', fileName);


      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('✅ Image uploaded successfully:', data.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Image upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images to Supabase Storage
   */
  static async uploadMultipleImages(files: File[], userId: string): Promise<string[]> {
    try {
      console.log(`🔄 Uploading ${files.length} images to Supabase Storage`);

      const uploadPromises = files.map(file => this.uploadImage(file, userId));
      const urls = await Promise.all(uploadPromises);

      console.log('✅ All images uploaded successfully');
      return urls;
    } catch (error) {
      console.error('❌ Multiple image upload error:', error);
      throw error;
    }
  }

  /**
   * Delete an image from Supabase Storage
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // Get userId/filename.ext

      console.log('🔄 Deleting image from Supabase Storage:', filePath);

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log('✅ Image deleted successfully');
    } catch (error) {
      console.error('❌ Image delete error:', error);
      throw error;
    }
  }

  /**
   * Validate image file before upload
   */
  private static validateImageFile(file: File): void {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      throw new Error('Invalid file name.');
    }
  }

  /**
   * Get storage bucket info
   */
  static async getBucketInfo(): Promise<any> {
    try {
      const { data, error } = await supabase.storage.getBucket(this.BUCKET_NAME);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Get bucket info error:', error);
      throw error;
    }
  }

  /**
   * List all files in user's folder
   */
  static async listUserImages(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ List user images error:', error);
      throw error;
    }
  }
}