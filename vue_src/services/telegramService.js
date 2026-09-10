import axios from 'axios';

const RENDER_BACKEND_URL = 'https://bt-upload-bot.onrender.com';

/**
 * Upload video directly to Telegram Cloud via Render backend
 * @param {File} file - Selected Video file
 * @param {Function} onProgress - Progress callback (0-100%)
 */
export async function uploadVideoToTelegram(file, onProgress) {
  const formData = new FormData();
  formData.append('video', file);

  const response = await axios.post(`${RENDER_BACKEND_URL}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percent);
      }
    },
  });

  return response.data; // { fileId, streamUrl, size, duration }
}

/**
 * Stream URL resolver for Telegram File IDs
 */
export function getTelegramStreamUrl(telegramFileId) {
  if (!telegramFileId) return '';
  return `${RENDER_BACKEND_URL}/api/stream/${telegramFileId}`;
}
