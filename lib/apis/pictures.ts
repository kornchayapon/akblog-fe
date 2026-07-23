import apiClient from '../axios/axios';

import { Picture } from '../interfaces/picture';

// Function to upload one or multiple images via Next.js API Route /api/pictures
export const uploadPictures = async (files: File[]): Promise<Picture[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post('/pictures', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = response.data;
  return Array.isArray(data) ? data : [data];
};

// Function to delete an image via Next.js API Route /api/pictures (No change needed)
export const deletePicture = async (id: number | string): Promise<boolean> => {
  await apiClient.delete('/pictures', {
    params: { id }, // Creates query: ?id=...
  });

  return true;
};
