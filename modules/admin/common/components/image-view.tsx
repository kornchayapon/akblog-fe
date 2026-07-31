import Image from 'next/image';

import { useMutation } from '@tanstack/react-query';

import { deletePicture } from '@/lib/apis/pictures';

import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { handleApiError } from '@/lib/functions/handle-api-error';

interface ImageViewProps {
  imageId: number;
  imagePath: string;
  clearUpload: () => void | null;
  onInsert?: (imagePath: string) => void;
}

const ImageView = ({
  imageId,
  imagePath,
  clearUpload,
  onInsert,
}: ImageViewProps) => {
  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => deletePicture(imageId),
    onSuccess: () => {
      clearUpload();
    },
    onError: (error: unknown) => {
      handleApiError(error, 'Delete picture error!');
    },
  });

  const handleDelete = () => {
    if (imageId) {
      deleteMutation.mutate(imageId);
    }
  };

  return (
    <div className='relative group w-full'>      
      <div className='relative inline-block'>
        <Image
          src={imagePath}
          alt='Uploaded content'
          className='object-cover'
          loading='eager'
          width={200}
          height={200}
        />
      </div>

      <Button
        variant='destructive'
        size='icon'
        className='absolute top-2 right-2 h-8 w-8 rounded-full shadow-md transition-opacity'
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        type='button'
      >
        {deleteMutation.isPending ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <X className='h-4 w-4' />
        )}
      </Button>

      {onInsert && (
        <Button
          variant='secondary'
          size='sm'
          className='absolute bottom-2 right-2 shadow-md'
          onClick={() => onInsert(imagePath)}
          type='button'
        >
          Insert Picture
        </Button>
      )}
    </div>
  );
};

export default ImageView;
