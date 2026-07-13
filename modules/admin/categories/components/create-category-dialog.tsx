'use client'

import { startTransition, useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCategoryFormValues, CreateCategorySchema } from '../schemas/category-schema';

import { useMutation } from '@tanstack/react-query';

import { toast } from 'sonner';

import { ADMIN_CATEGORIES_KEY } from '@/lib/constants/query-key';
import { queryClient } from '@/lib/react-query/query-client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import CategoryProcessDialogSkeleton from './category-process-dialog-skeleton';
import FormErrorMessage from '@/modules/guest/common/components/form-error-message';
import FormFieldError from '@/modules/guest/common/components/form-field-error';
import { createCategory, CreateCategoryPayload } from '@/lib/apis/categories';


interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCategoryDialog = ({
  open,
  onOpenChange,
}: CreateCategoryDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(CreateCategorySchema),
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

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory({ payload }),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_KEY] });
      reset();
      onOpenChange(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setErrorMessage(err?.message);
      reset(getValues());
      toast.error('Unable to create category: ' + err?.message);
    },
  });

  const onSubmit = (data: CreateCategoryFormValues) => {
    const payload: CreateCategoryPayload = {
      ...data,
    };

    mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Create a new category. Click save when finished.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <CategoryProcessDialogSkeleton />
        ) : (
          <div className='mt-4 space-y-6'>
            <FormErrorMessage message={errorMessage} />
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  disabled={isPending}
                  placeholder='Category name'
                  {...register('name')}
                />
                <FormFieldError message={errors.name?.message} />
              </div>

              {/* <div className='space-y-2'>
                <Label htmlFor='slug'>Slug (e.g. hello-world)</Label>
                <Input
                  id='slug'
                  disabled={isPending}
                  placeholder='Category slug'
                  {...register('slug')}
                />
                <FormFieldError message={errors.slug?.message} />
              </div> */}

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Input
                  id='description'
                  {...register('description')}
                  placeholder='Description'
                  disabled={isPending}
                />
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  type='button'
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
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

export default CreateCategoryDialog;
