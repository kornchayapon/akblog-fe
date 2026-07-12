'use client'

import { startTransition, useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTagFormValues, CreateTagSchema } from '../schemas/tag-schema';

import { useMutation } from '@tanstack/react-query';

import { toast } from 'sonner';

import { ADMIN_TAGS_KEY } from '@/lib/constants/query-key';
import { queryClient } from '@/lib/react-query/query-client';
import { CreateTagPayload, createTag } from '@/lib/apis/tags';

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


import TagProcessDialogSkeleton from './tag-process-dialog-skeleton';

import FormErrorMessage from '@/modules/guest/common/components/form-error-message';
import FormFieldError from '@/modules/guest/common/components/form-field-error';

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTagDialog = ({ open, onOpenChange }: CreateTagDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<CreateTagFormValues>({
    resolver: zodResolver(CreateTagSchema),
    defaultValues: {
      name: 'full stack',
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
    mutationFn: (payload: CreateTagPayload) => createTag({ payload }),
    onSuccess: () => {
      toast.success('Tag created successfully');
      queryClient.invalidateQueries({ queryKey: [ADMIN_TAGS_KEY] });
      reset();
      onOpenChange(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setErrorMessage(err?.message);
      reset(getValues());
      toast.error('Unable to create tag: ' + err?.message);
    },
  });

  const onSubmit = (data: CreateTagFormValues) => {
    const payload: CreateTagPayload = {
      ...data,
    };

    mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Tag</DialogTitle>
          <DialogDescription>
            Create a new tag. Click save when finished.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <TagProcessDialogSkeleton />
        ) : (
          <div className='mt-4 space-y-6'>
            <FormErrorMessage message={errorMessage} />
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  disabled={isPending}
                  placeholder='Tag name'
                  {...register('name')}
                />
                <FormFieldError message={errors.name?.message} />
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

export default CreateTagDialog;
