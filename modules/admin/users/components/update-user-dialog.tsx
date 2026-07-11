'use client'

import { startTransition, useEffect, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUserFormValues, UpdateUserSchema } from "../schemas/user-schema";

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

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query/query-client";
import { ADMIN_USER_KEY } from "@/lib/constants/query-key";
import { fetchUser, updateUser, UpdateUserPayload } from "@/lib/apis/users";

import FormFieldError from "@/modules/guest/common/components/form-field-error";
import FormErrorMessage from "@/modules/guest/common/components/form-error-message";
import UserProcessDialogSkeleton from "./user-process-dialog-skeleton";
import SelectOptions from "../../common/components/select-options";

import { userRoles } from "./create-user-dialog";

interface UpdateUserDialogProps {
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateUserDialog = ({
  userId,
  open,
  onOpenChange,
}: UpdateUserDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userQueryEnabled = open && userId != null;  

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    control,
    formState: { errors, isDirty },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: '',
    },
  });

  useEffect(() => {
    if (isDirty) {
      startTransition(() => {
        setErrorMessage(null);
      });
    }
  }, [isDirty]);

  useEffect(() => {
    if (!open) {
      startTransition(() => setErrorMessage(null));
    }
  }, [open]);

  useEffect(() => {
    if (open && userId != null) {
      startTransition(() => setErrorMessage(null));
    }
  }, [open, userId]);

  // Fetch user data (only when dialog is open and we have an id — avoids fetchUser throwing on null)
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: [ADMIN_USER_KEY, userId],
    queryFn: async ({ signal }) => {
      const res = await fetchUser({ userId, signal });
      return res ?? null;
    },
    enabled: userQueryEnabled,
  });

  const isUserLoading = userQueryEnabled && (isPending || isFetching);

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      reset();
    }
  };

  // Mutation: Update user
  const { mutate, isPending: isMutating } = useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser({ payload }),
    onSuccess: () => {
      toast.success('Update user successful');
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
        'Update user error (mutation)';

      setErrorMessage(message);
      reset(getValues());
      toast.error('User not updated: ' + err?.message);
    },
  });

  const onSubmit = (formData: UpdateUserFormValues) => {
    const resolvedUserId = userId ?? data?.id;
    if (resolvedUserId == null) {
      toast.error('User ID is required');
      return;
    }

    const payload: UpdateUserPayload = {
      userId: resolvedUserId,
      ...formData,
    };

    mutate(payload);
  };

  useEffect(() => {
    if (data) {
      reset({
        email: data.email,
        password: '', // Keep empty unless updating
        firstName: data.firstName,
        lastName: data.lastName ?? '',
        role: data.role,
      });
    }
  }, [data, reset]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>
            Update user information, click save when finish
          </DialogDescription>
        </DialogHeader>

        {isUserLoading ? (
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
                  disabled={isUserLoading || isMutating}
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
                  disabled={isUserLoading || isMutating}
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
                  disabled={isUserLoading || isMutating}
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
                  disabled={isUserLoading || isMutating}
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
                      disabled={isUserLoading || isMutating}
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
                  disabled={isUserLoading || isMutating}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isUserLoading}>
                  {(isUserLoading || isMutating) && (
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
  )
}

export default UpdateUserDialog