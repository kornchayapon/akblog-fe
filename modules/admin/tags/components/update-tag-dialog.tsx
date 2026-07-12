'use client'

import { startTransition, useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { UpdateTagFormValues, UpdateTagSchema } from '../schemas/tag-schema';
import { zodResolver } from '@hookform/resolvers/zod';

import { useMutation, useQuery } from '@tanstack/react-query';
import { UpdateTagPayload, fetchTag, updateTag } from '@/lib/apis/tags';
import { ADMIN_TAGS_KEY } from '@/lib/constants/query-key';
import { queryClient } from '@/lib/react-query/query-client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import TagProcessDialogSkeleton from './tag-process-dialog-skeleton';
import FormErrorMessage from '@/modules/guest/common/components/form-error-message';
import FormFieldError from '@/modules/guest/common/components/form-field-error';

interface UpdateTagDialogProps {
  tagId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateTagDialog = ({
  tagId,
  open,
  onOpenChange,
}: UpdateTagDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<UpdateTagFormValues>({
    resolver: zodResolver(UpdateTagSchema),
    defaultValues: {
      name: '',      
    },
  });

  useEffect(() => {
    if (isDirty) {
      startTransition(() => {
        setErrorMessage(null);
      });
    }
  }, [isDirty]);

  // Fetch Tag
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: [ADMIN_TAGS_KEY, tagId],
    queryFn: async ({ signal }) => {
      // Ensure undefined is never returned to React Query
      const res = await fetchTag({ tagId, signal });
      return res ?? null;
    },
  });

  // handle error message from useQuery
  useEffect(() => {
    if (!isError) return;

    const fallbackMessage = 'Failed to fetch tag data';

    if (error instanceof Error) {
      startTransition(() => {
        setErrorMessage(error.message || fallbackMessage);
      });
      return;
    }

    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      startTransition(() => {
        setErrorMessage(
          (error as { message?: string }).message ?? fallbackMessage,
        );
      });
      return;
    }

    startTransition(() => {
      setErrorMessage(fallbackMessage);
    });
  }, [isError, error]);

  useEffect(() => {
    if (data) {
      console.log('useEffect tag data', data);

      reset({
        name: data.name,
      });
    }
  }, [data, reset]);

  // Mutation: Update tag
  const { mutate, isPending: isMutating } = useMutation({
    mutationFn: (payload: UpdateTagPayload) => updateTag({ payload }),
    onSuccess: () => {
      toast.success('Update tag successful');
      queryClient.invalidateQueries({ queryKey: [ADMIN_TAGS_KEY] });
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        err.response?.data?.message ||
        err.message ||
        'Update tag error (mutation)';

      setErrorMessage(message);
      reset(getValues());
      toast.error('Tag not updated: ' + err?.message);
    },
  });

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      reset();
    }
  };

  const onSubmit = (formData: UpdateTagFormValues) => {
    if (!tagId) {
      toast.error('Tag ID is required');
      return;
    }

    const payload: UpdateTagPayload = {
      tagId,
      ...formData,
    };

    mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Tag</DialogTitle>
          <DialogDescription>
            Update tag information, click save when finish
          </DialogDescription>
        </DialogHeader>

        {isPending || isFetching ? (
          <TagProcessDialogSkeleton />
        ) : (
          <div className='mt-4 space-y-6'>
            <FormErrorMessage message={errorMessage} />
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              {/* first name */}
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  placeholder='Name'
                  disabled={isPending || isMutating}
                  {...register('name')}
                />
                <FormFieldError message={errors.name?.message} />
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  type='button'
                  onClick={() => onOpenChange(false)}
                  disabled={isPending || isMutating}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {(isPending || isMutating) && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTagDialog;
