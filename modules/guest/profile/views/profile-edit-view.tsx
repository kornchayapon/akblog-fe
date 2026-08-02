'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { queryClient } from '@/lib/react-query/query-client';
import { useMutation } from '@tanstack/react-query';
import { updateUserProfile } from '@/lib/apis/users';

import { USER_PROFILE_KEY } from '@/lib/constants/query-key';
import { resetPasswordRequest } from '@/lib/apis/auth';
import { uploadPictures } from '@/lib/apis/pictures';
import { Picture } from '@/lib/interfaces/picture';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import UploadThumbnail from '@/modules/admin/common/components/upload-thumbnail';
import ImageView from '@/modules/admin/common/components/image-view';

import {
  memberProfileFormSchema,
  type MemberProfileFormValues,
} from '../data/profile-schema';

import { User, Mail, Loader2, ImageIcon, KeyRound, Send } from 'lucide-react';

import { useUser } from '../../auth/hooks/use-user';
import { useAuth } from '../../auth/hooks/use-auth';

export type AvatarState = {
  id?: number | null;
  path?: string | null;
  file?: File | null;
};

function ProfileEditSkeleton() {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 lg:pt-24 pb-16'>
      <div className='container mx-auto px-4 lg:px-6'>
        <div className='py-8 border-b border-slate-200 dark:border-slate-800'>
          <div className='h-10 w-48 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse' />
          <div className='h-5 w-64 mt-2 rounded bg-slate-200 dark:bg-slate-800 animate-pulse' />
        </div>
        <div className='grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr] mt-10'>
          <div className='rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6'>
            <div className='aspect-square w-full max-w-[200px] mx-auto rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse' />
          </div>
          <div className='rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='space-y-2'>
                <div className='h-4 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse' />
                <div className='h-11 w-full rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfileEditView() {
  const { user, isLoading: isUserLoading } = useUser();
  const { actions } = useAuth();

  const [avatar, setAvatar] = useState<AvatarState>({
    id: null,
    path: null,
    file: null,
  });
  const [uploadKey, setUploadKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<MemberProfileFormValues>({
    resolver: zodResolver(memberProfileFormSchema),
    defaultValues: { firstName: '', lastName: '' },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName ?? '',
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (isDirty) {
      startTransition(() => setErrorMessage(null));
    }
  }, [isDirty]);

  useEffect(() => {
    if (user?.avatar) {
      const a = user.avatar as Picture;
      startTransition(() => {
        setAvatar({
          id: a.id,
          path: a.path,
          file: null,
        });
      });
    } else {
      startTransition(() => {
        setAvatar({ id: null, path: null, file: null });
      });
    }
  }, [user]);

  const filePreviewUrl = useMemo(() => {
    if (!avatar.file) return null;
    return URL.createObjectURL(avatar.file);
  }, [avatar.file]);
  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const updateProfileMutation = useMutation({
    mutationFn: (payload: {
      firstName: string;
      lastName: string;
      email: string;
      avatar?: number | null;
    }) =>
      updateUserProfile({
        userId: user!.id,
        currentRole: user!.role,
        payload: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          avatar: payload.avatar,
        },
      }),
    onSuccess: () => {
      toast.success('Update profile successful');
      queryClient.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
      setErrorMessage(null);
      setAvatar((prev) => ({ ...prev, file: null }));
      setUploadKey((k) => k + 1);
    },
    onError: (err: Error) => {
      const msg = err?.message ?? 'Could not update your profile.';
      setErrorMessage(msg);
      reset(getValues());
      toast.error(msg);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => resetPasswordRequest({ email }),
    onSuccess: () => {
      actions.signOut();
      toast.success(
        'If an account exists for this email, a reset link has been sent. Check your inbox.',
      );
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? 'Could not send reset link.');
    },
  });

  const submitProfile = (avatarId: number | null) => {
    const values = getValues();
    updateProfileMutation.mutate({
      firstName: values.firstName,
      lastName: values.lastName,
      email: user!.email,
      avatar: avatarId,
    });
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => uploadPictures([file]),
    onSuccess: (data: Picture[]) => {
      const image = data[0];
      if (image) {
        setErrorMessage(null);
        setAvatar((prev) => ({
          ...prev,
          id: image.id,
          path: image.path,
          file: null,
        }));
        submitProfile(image.id);
      }
    },
    onError: (err: Error) => {
      setErrorMessage(err.message ?? 'Failed to upload image');
      toast.error(err.message ?? 'Failed to upload image');
    },
  });

  const userAvatarId = (user?.avatar as Picture | undefined)?.id ?? null;
  const avatarChanged = avatar.id !== userAvatarId;
  const hasNewAvatarFile = !!avatar.file;
  const hasChanges = isDirty || avatarChanged || hasNewAvatarFile;

  const onSubmit = () => {
    if (!user) return;
    if (avatar.file) {
      uploadAvatarMutation.mutate(avatar.file);
    } else {
      submitProfile(avatar.id ?? null);
    }
  };

  if (isUserLoading || !user) {
    return <ProfileEditSkeleton />;
  }

  const isUploading = uploadAvatarMutation.isPending;
  const isMutating = updateProfileMutation.isPending;
  const isSaving = isUploading || isMutating;

  console.log('avatar', avatar);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 lg:pt-24 pb-16'>
      <div className='container mx-auto px-4 lg:px-6'>
        {isSaving && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <div className='flex items-center gap-3 rounded-xl bg-slate-900 dark:bg-slate-800 px-6 py-4 text-white shadow-xl'>
              <Loader2 className='h-5 w-5 animate-spin' />
              <span className='text-sm font-medium'>Saving...</span>
            </div>
          </div>
        )}

        <div className='py-8 border-b border-slate-200 dark:border-slate-800'>
          <h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3'>
            <span className='w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center'>
              <User className='w-6 h-6' />
            </span>
            Edit Profile
          </h1>
          <p className='text-slate-500 dark:text-slate-400 mt-2'>
            Manage your personal information and profile picture
          </p>
        </div>

        <div
          className={`grid gap-8 ${user.socialAcc? 'lg:grid-cols-1' : 'lg:grid-cols-[minmax(0,280px)_1fr]'} mt-10 ${isSaving ? 'pointer-events-none opacity-70' : ''}`}
        >
          {/* Left: Avatar */}
          {!user.socialAcc && (
            <div className='rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden'>
              <div className='bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800'>
                <div className='flex items-center gap-2 text-slate-600 dark:text-slate-300'>
                  <ImageIcon className='size-5 text-amber-500' />
                  <span className='font-semibold'>Profile Picture</span>
                </div>
                <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                  This picture will be shown in the system
                </p>
              </div>
              <div className='p-6'>
                {avatar.id != null && avatar.path && !avatar.file ? (
                  <>
                    <div className='flex flex-col items-center w-full min-w-0'>
                      <div className='relative w-full max-w-[200px] aspect-square overflow-hidden rounded-2xl ring-2 ring-slate-200 dark:ring-slate-700 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'>
                        <ImageView
                          imageId={avatar.id}
                          imagePath={avatar.path}
                          clearUpload={() =>
                            setAvatar({ id: null, path: null, file: null })
                          }
                        />
                      </div>
                    </div>
                    <div className='mt-4'>
                      <UploadThumbnail
                        key={uploadKey}
                        uploadMutation={uploadAvatarMutation}
                        setSelectedFile={(file) =>
                          setAvatar((prev) => ({ ...prev, file }))
                        }
                        label='Upload Profile Picture'
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className='flex flex-col items-center w-full min-w-0'>
                      <div className='relative w-full max-w-[200px] aspect-square overflow-hidden rounded-2xl ring-2 ring-slate-200 dark:ring-slate-700 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-slate-100 dark:bg-slate-800'>
                        {filePreviewUrl ? (
                          <Image
                            src={filePreviewUrl}
                            alt='Selected picture'
                            className='object-cover'
                            fill
                            sizes='200px'
                            priority
                          />
                        ) : (
                          <Image
                            priority
                            src='/images/user.png'
                            alt='Profile Picture'
                            className='object-cover'
                            fill
                            sizes='200px'
                          />
                        )}
                      </div>
                    </div>
                    <div className='mt-4'>
                      <UploadThumbnail
                        key={uploadKey}
                        uploadMutation={uploadAvatarMutation}
                        setSelectedFile={(file) =>
                          setAvatar((prev) => ({ ...prev, file }))
                        }
                        label='Upload Profile Picture'
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Right: Form */}
          <div className='rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden'>
            <div className='bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800'>
              <div className='flex items-center gap-2 text-slate-600 dark:text-slate-300'>
                <User className='size-5 text-amber-500' />
                <span className='font-semibold'>Personal Information</span>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                Edit your display name in the system
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='p-6 sm:p-8 space-y-6'>
                {errorMessage && (
                  <Alert
                    variant='destructive'
                    className='rounded-xl border-red-200 dark:border-red-900/50'
                  >
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='firstName'
                      className='text-slate-700 dark:text-slate-300 font-medium'
                    >
                      First Name
                    </Label>
                    <Input
                      id='firstName'
                      {...register('firstName')}
                      disabled={isSaving}
                      placeholder='First Name'
                      className='h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus-visible:ring-amber-500/50'
                    />
                    {errors.firstName && (
                      <p className='text-xs font-medium text-red-500'>
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='lastName'
                      className='text-slate-700 dark:text-slate-300 font-medium'
                    >
                      Last Name
                    </Label>
                    <Input
                      id='lastName'
                      {...register('lastName')}
                      disabled={isSaving}
                      placeholder='Last Name'
                      className='h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus-visible:ring-amber-500/50'
                    />
                    {errors.lastName && (
                      <p className='text-xs font-medium text-red-500'>
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium'>
                    <Mail className='size-4 text-slate-500' />
                    Email
                  </Label>
                  <Input
                    type='email'
                    value={user.email}
                    disabled
                    className='h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  />
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    Email is used as the login account and cannot be changed
                    here.
                  </p>
                </div>

                {/* Reset password */}
                <div className='pt-4 border-t border-slate-200 dark:border-slate-800'>
                  <div className='flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium mb-1'>
                    <KeyRound className='size-4 text-amber-500' />
                    Password
                  </div>
                  <p className='text-sm text-slate-500 dark:text-slate-400 mb-3'>
                    Want to change your password? We will send a reset password
                    link to your email.
                  </p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={resetPasswordMutation.isPending || isSaving}
                    className='rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 hover:text-amber-700 dark:hover:text-amber-400 gap-2'
                    onClick={() => resetPasswordMutation.mutate(user.email)}
                  >
                    {resetPasswordMutation.isPending ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      <Send className='w-4 h-4' />
                    )}
                    Send Reset Password Link
                  </Button>
                </div>
              </div>

              <div className='flex flex-col-reverse sm:flex-row gap-3 justify-end px-6 py-5 sm:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    reset({
                      firstName: user.firstName,
                      lastName: user.lastName ?? '',
                    });
                    setAvatar({
                      id: (user.avatar as Picture)?.id ?? null,
                      path: (user.avatar as Picture)?.path ?? null,
                      file: null,
                    });
                  }}
                  disabled={!hasChanges || isSaving}
                  className='rounded-xl border-slate-200 dark:border-slate-700'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={!hasChanges || isSaving}
                  className='rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20'
                >
                  {isSaving && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
