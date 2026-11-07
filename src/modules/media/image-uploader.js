/**
 * Mailora.ai — Image Uploader Module
 */

import { mediaService } from '../../services/media.service.js';

export async function uploadImageFile(file) {
  if (!file) throw new Error('Không có tệp nào được chọn.');

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Chỉ chấp nhận các định dạng ảnh: JPEG, PNG, WEBP, GIF.');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Kích thước ảnh không được vượt quá 5MB.');
  }

  return await mediaService.uploadAndSaveMedia(file, 'uploads');
}
