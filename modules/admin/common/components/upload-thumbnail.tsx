'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UseMutationResult } from '@tanstack/react-query';

import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Picture } from '@/lib/interfaces/picture';

const FileListSchema = z
  .any()
  .refine(
    (val) =>
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as unknown as { FileList?: unknown }).FileList !==
        'undefined' &&
      val instanceof (globalThis as unknown as { FileList: new () => FileList })
        .FileList,
    'Expected FileList',
  )
  .refine((files: FileList) => files.length > 0, 'File is required')
  .refine((files: FileList) => files.length === 1, 'Only one file is allowed')
  .refine((files: FileList) => files[0].size <= 5000000, 'Max size is 5MB')
  .refine(
    (files: FileList) =>
      ['image/jpeg', 'image/png'].includes(files[0].type),
    'Only .jpg and .png are supported',
  );

const pictureSchema = z.object({
  file: FileListSchema,
});

type PictureFormValues = z.infer<typeof pictureSchema>;

interface UploadThumbnailProps {
  setSelectedFile: (file: File | null) => void;
  uploadMutation: UseMutationResult<Picture[], Error, File, unknown>;
  /** Label shown above the file input. Default: "Upload Thumbnail" */
  label?: string;
}

export default function UploadThumbnail({
  setSelectedFile,
  uploadMutation,
  label = 'Upload Thumbnail',
}: UploadThumbnailProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, reset } = useForm<PictureFormValues>({
    resolver: zodResolver(pictureSchema),
  });

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 1MB

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size does not exceed 1MB
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('File size must not exceed 1MB');
      setSelectedFile(null);
      setPreviewUrl(null);
      // Reset input to allow user to select a new file
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const clearPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    reset();
  };

  return (
    <div className='w-full p-6 space-y-4 border rounded-lg shadow-sm'>
      <div className='space-y-2'>
        <Label htmlFor='picture'>{label}</Label>
        {errorMessage && (
          <div className='p-3 text-sm text-red-500 bg-red-50 rounded-md'>
            Error: {errorMessage}
          </div>
        )}

        <div className='space-y-2'>
          <Input
            id='picture'
            type='file'
            accept='image/*'
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

          {previewUrl && (
          <div className='relative inline-block'>
              <Image
                src={previewUrl}
                alt='Preview'
                className='rounded-md border'
                loading="lazy"
                width={300}
                height={300}
              />

              <Button
                type='button'
                variant='destructive'
                size='icon'
                className='absolute top-2 right-2'
                onClick={clearPreview}
                disabled={uploadMutation.isPending}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
