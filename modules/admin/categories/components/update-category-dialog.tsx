import { startTransition, useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import {
  UpdateCategoryFormValues,
  UpdateCategorySchema,
} from '../schemas/category-schema';
import { zodResolver } from '@hookform/resolvers/zod';

import { useMutation, useQuery } from '@tanstack/react-query';

import { ADMIN_CATEGORIES_KEY } from '@/lib/constants/query-key';
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

import CategoryProcessDialogSkeleton from './category-process-dialog-skeleton';
import FormErrorMessage from '@/modules/guest/common/components/form-error-message';
import FormFieldError from '@/modules/guest/common/components/form-field-error';

import { fetchCategory, updateCategory, UpdateCategoryPayload } from '@/lib/apis/categories';

interface UpdateCategoryDialogProps {
  categoryId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateCategoryDialog = ({
  categoryId,
  open,
  onOpenChange,
}: UpdateCategoryDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<UpdateCategoryFormValues>({
    resolver: zodResolver(UpdateCategorySchema),
    defaultValues: {
      name: '',      
      description: '',
    },
  });

  useEffect(() => {
    if (isDirty) {
      startTransition(() => {
        setErrorMessage(null);
      });
    }
  }, [isDirty]);

  // Fetch Category
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: [ADMIN_CATEGORIES_KEY, categoryId],
    queryFn: async ({ signal }) => {
      // Ensure undefined is never returned to React Query
      const res = await fetchCategory({ categoryId, signal });
      return res ?? null;
    },
  });

  // handle error message from useQuery
  useEffect(() => {
    if (!isError) return;

    const fallbackMessage = 'Failed to fetch category data';

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
      console.log('useEffect category data', data);

      reset({
        name: data.name,
        description: data.description,
      });
    }
  }, [data, reset]);

  // Mutation: Update category
  const { mutate, isPending: isMutating } = useMutation({
    mutationFn: (payload: UpdateCategoryPayload) => updateCategory({ payload }),
    onSuccess: () => {
      toast.success('Update category successful');
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_KEY] });
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
        'Update category error (mutation)';

      setErrorMessage(message);
      reset(getValues());
      toast.error('Category not updated: ' + err?.message);
    },
  });

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      reset();
    }
  };

  const onSubmit = (formData: UpdateCategoryFormValues) => {
    if (!categoryId) {
      toast.error('Category ID is required');
      return;
    }

    const payload: UpdateCategoryPayload = {
      categoryId,
      ...formData,
    };

    mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Category</DialogTitle>
          <DialogDescription>
            Update category information, click save when finish
          </DialogDescription>
        </DialogHeader>

        {isPending || isFetching ? (
          <CategoryProcessDialogSkeleton />
        ) : (
          <div className='mt-4 space-y-6'>
            <FormErrorMessage message={errorMessage} />
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              {/* name */}
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

              {/* description */}
              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Input
                  id='description'
                  placeholder='Description'
                  disabled={isPending || isMutating}
                  {...register('description')}
                />
                <FormFieldError message={errors.description?.message} />
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

export default UpdateCategoryDialog;
