import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { uploadPictures } from '@/lib/apis/pictures';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageView from './image-view';
import { Picture } from '@/lib/interfaces/picture';

const pictureSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'File is required')
    .refine((files) => files.length <= 5, '5 files upload')
    .refine(
      (files) => Array.from(files).every((file) => file.size <= 5_000_000),
      'Max size 5MB',
    )
    .refine(
      (files) =>
        Array.from(files).every((file) =>
          ['image/jpeg', 'image/png'].includes(file.type),
        ),
      'Only .jpg and .png are supported',
    ),
});

type PictureFormValues = z.infer<typeof pictureSchema>;

interface UploadPicturesProps {
  uploadedFiles: Picture[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<Picture[]>>;  
  onInsert?: (imagePath: string) => void;
}

const UploadPictures = ({
  uploadedFiles,
  setUploadedFiles,
  onInsert,
}: UploadPicturesProps) => {  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
  } = useForm<PictureFormValues>({
    resolver: zodResolver(pictureSchema),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadPictures(files),
    onSuccess: (data: Picture[]) => {      
      setUploadedFiles((prev) => [...prev, ...data]);
      setErrorMessage(null);
    },
    onError: (error) => {
      handleError(error);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadMutation.mutate(Array.from(files));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (error: any) => {
    if (axios.isAxiosError(error)) {
      setErrorMessage(error.response?.data?.message || error.message);
    } else {
      setErrorMessage((error as Error).message);
    }
  };

  const removeImageById = (id: number) => {
    setUploadedFiles((prev) => prev.filter((img) => img.id !== id));    
  };

  return (
    <div className='w-full p-6 space-y-4 border rounded-lg shadow-sm'>
      <div className='space-y-2'>
        <Label htmlFor='picture'>Upload Pictures</Label>

        {/* {uploadedFiles.length === 0 && ( */}
          <div className='space-y-2'>
            <Input
              id='picture'
              type='file'
              accept='image/*'
              multiple
              disabled={uploadMutation.isPending}
              {...register('file', {
                onChange: handleFileChange,
              })}
            />

            {uploadMutation.isPending && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground animate-pulse'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Uploading...</span>
              </div>
            )}

            {errors.file && (
              <p className='text-sm text-red-500'>
                {errors.file.message as string}
              </p>
            )}
          </div>
        {/* )} */}

        {uploadedFiles.length > 0 && (
          <div className='flex gap-4 mt-4 flex-col lg:flex-row'>
            {uploadedFiles.map((image) => (
              <ImageView
                key={image.id}
                imageId={image.id}
                imagePath={image.path}
                clearUpload={() => removeImageById(image.id)}                
                onInsert={onInsert}
              />
            ))}
          </div>
        )}

        {errorMessage && (
          <div className='p-3 text-sm text-red-500 bg-red-50 rounded-md'>
            Error: {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPictures;
