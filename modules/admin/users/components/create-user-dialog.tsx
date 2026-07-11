'use client';

import { startTransition, useEffect, useState } from 'react';

import { UserRole } from '@/lib/enums/user-role.enum';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateUserFormValues, CreateUserSchema } from '../schemas/user-schema';

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

import FormErrorMessage from '@/modules/guest/common/components/form-error-message';
import FormFieldError from '@/modules/guest/common/components/form-field-error';
import UserProcessDialogSkeleton from './user-process-dialog-skeleton';
import SelectOptions from '../../common/components/select-options';

import { Loader2 } from 'lucide-react';

import { createUser, CreateUserPayload } from '@/lib/apis/users';

import { toast } from 'sonner';

import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query/query-client';

import { ADMIN_USER_KEY } from '@/lib/constants/query-key';

export const userRoles = [
  { value: UserRole.MEMBER, label: 'Member' },
  { value: UserRole.STAFF, label: 'Staff' },
  { value: UserRole.ADMIN, label: 'Admin' },
];

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateUserDialog = ({ open, onOpenChange }: CreateUserDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    control,
    formState: { errors, isDirty },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      firstName: 'member3',
      lastName: 'member3-lastname',
      email: 'member3@gmail.com',
      password: '123456',
      role: 'staff',
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
    mutationFn: (payload: CreateUserPayload) => createUser({ payload }),
    onSuccess: () => {
      toast.success('Create user successful');
      queryClient.invalidateQueries({ queryKey: [ADMIN_USER_KEY] });
      reset();
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
        'Create user error (mutation)';

      setErrorMessage(message);
      reset(getValues());

      toast.error('User not created, ' + message);
    },
  });

  const onSubmit = (formData: CreateUserFormValues) => {
    const payload: CreateUserPayload = {
      ...formData,
      role: formData.role as string,
      lastName: formData.lastName ?? '',
    };
    mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Add new user information, click save when finish
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <UserProcessDialogSkeleton />
        ) : (
          <div className='mt-4 space-y-6'>
            <FormErrorMessage message={errorMessage} />
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              {/* first name */}
              <div className='space-y-2'>
                <Label htmlFor='first-name'>First name</Label>
                <Input
                  id='first-name'
                  placeholder='Your first name'
                  disabled={isPending}
                  {...register('firstName')}
                />
                <FormFieldError message={errors.firstName?.message} />
              </div>

              {/* last name */}
              <div className='space-y-2'>
                <Label htmlFor='last-name'>Last name</Label>
                <Input
                  id='last-name'
                  placeholder='Your last name'
                  disabled={isPending}
                  {...register('lastName')}
                />
                <FormFieldError message={errors.lastName?.message} />
              </div>

              {/* email */}
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  placeholder='Your email'
                  disabled={isPending}
                  {...register('email')}
                />
                <FormFieldError message={errors.email?.message} />
              </div>

              {/* password */}
              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  placeholder='Your password'
                  type='password'
                  disabled={isPending}
                  {...register('password')}
                />
                <FormFieldError message={errors.password?.message} />
              </div>

              {/* role */}
              <div className='space-y-2'>
                <Label htmlFor='user-roles'>Roles</Label>
                {/* User Controller to wrap custom Select component */}
                <Controller
                  name='role'
                  control={control}
                  render={({ field }) => (
                    <SelectOptions
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                      options={userRoles}
                      id='user-roles'
                    />
                  )}
                />
                <FormFieldError message={errors.role?.message} />
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

export default CreateUserDialog;
