'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { resetPasswordTokenVerify, resetPassword } from '@/lib/apis/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Lock,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { checkAxiosError } from '@/lib/functions/check-axios-error';
import { useAuth } from '../hooks/use-auth';

const passwordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof passwordSchema>;

type VerifyStatus = 'idle' | 'loading' | 'valid' | 'invalid' | 'success';

interface ResetPasswordViewProps {
  token: string;
}

const ResetPasswordView = ({ token }: ResetPasswordViewProps) => {
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { actions } = useAuth();

  const verifyToken = useCallback(async () => {
    if (!token) {
      setVerifyStatus('invalid');
      return;
    }
    setVerifyStatus('loading');
    setErrorMessage(null);
    try {
      await resetPasswordTokenVerify({ token });
      setVerifyStatus('valid');
    } catch (error) {
      setVerifyStatus('invalid');
      if (checkAxiosError(error)) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Reset password failed. Please try again.');
      }
    }
  }, [token]);

  useEffect(() => {
    // Avoid synchronous setState in effect by running after commit
    const id = setTimeout(() => verifyToken(), 0);
    return () => clearTimeout(id);
  }, [verifyToken]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMessage(null);
    try {
      await resetPassword({ token, password: data.password });
      setVerifyStatus('success');
      toast.success('Your password has been reset successfully');
    } catch (error) {
      if (checkAxiosError(error)) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Reset password failed. Please try again.');
      }
    }
  };

  if (verifyStatus === 'loading') {
    return (
      <div className='flex min-h-[80vh] items-center justify-center bg-background px-4'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
          <p className='font-medium text-muted-foreground'>Verifying link...</p>
        </div>
      </div>
    );
  }

  if (verifyStatus === 'invalid') {
    return (
      <div className='flex min-h-[80vh] items-center justify-center bg-background px-4 py-12'>
        <div className='w-full max-w-md'>
          <div className='overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-2xl shadow-primary/10'>
            <div className='space-y-6 p-10 text-center'>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/10'>
                <AlertCircle className='h-8 w-8 text-destructive' />
              </div>
              <div>
                <h1 className='font-serif text-2xl font-semibold text-foreground'>
                  Invalid or expired link
                </h1>
                <p className='mt-2 text-sm text-muted-foreground'>
                  This password reset link may have expired or already been
                  used. <br />
                  Please request a new link from the Forgot Password page.
                </p>
                {errorMessage && (
                  <p className='mt-2 text-sm text-red-600 dark:text-red-400'>
                    {errorMessage}
                  </p>
                )}
              </div>
              <Button asChild className='h-12 w-full rounded-2xl font-bold'>
                <Link href='/forgot'>
                  Request new password reset link
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
              <p className='text-sm text-muted-foreground'>
                <Link href='/' className='text-primary hover:underline'>
                  Back to Home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verifyStatus === 'success') {
    return (
      <div className='flex min-h-[80vh] items-center justify-center bg-background px-4 py-12'>
        <div className='w-full max-w-md'>
          <div className='overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-2xl shadow-primary/10'>
            <div className='space-y-6 p-10 text-center'>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10'>
                <CheckCircle2 className='h-8 w-8 text-primary' />
              </div>
              <div>
                <h1 className='font-serif text-2xl font-semibold text-foreground'>
                  Password reset successful
                </h1>
                <p className='mt-2 text-sm text-muted-foreground'>
                  You can now log in with your new password.
                </p>
              </div>
              <Button asChild className='h-12 w-full rounded-2xl font-bold'>
                <Link href='/' onClick={() => actions.signOut()}>
                  Go to Login
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative flex min-h-[80vh] items-center justify-center bg-background px-4 py-12'>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -right-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/6 blur-[120px]' />
        <div className='absolute -bottom-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-[120px]' />
      </div>

      <div className='relative w-full max-w-md'>
        <div className='overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-2xl shadow-primary/10'>
          <div className='space-y-4 p-10 pb-6 text-center'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10'>
              <Lock className='h-8 w-8 text-primary' />
            </div>
            <div className='space-y-2'>
              <h1 className='font-serif text-3xl font-medium italic tracking-tight text-foreground'>
                Reset Password
              </h1>
              <p className='text-sm font-medium text-muted-foreground'>
                Enter your new password below
              </p>
            </div>
          </div>

          <div className='px-10 pb-10'>
            {errorMessage && (
              <div className='mb-4 p-4 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/50'>
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
              <div className='space-y-2'>
                <Label className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                  New Password
                </Label>
                <div className='group relative'>
                  <Lock className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary' />
                  <Input
                    type='password'
                    placeholder='••••••••'
                    autoComplete='new-password'
                    className='h-12 rounded-2xl border-0 bg-muted pl-11 focus-visible:ring-2 focus-visible:ring-ring'
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className='text-xs font-bold text-red-500'>
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                  Confirm New Password
                </Label>
                <div className='group relative'>
                  <Lock className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary' />
                  <Input
                    type='password'
                    placeholder='••••••••'
                    autoComplete='new-password'
                    className='h-12 rounded-2xl border-0 bg-muted pl-11 focus-visible:ring-2 focus-visible:ring-ring'
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className='text-xs font-bold text-red-500'>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='h-12 w-full rounded-2xl font-bold shadow-lg shadow-primary/15'
              >
                {isSubmitting ? (
                  <Loader2 className='w-5 h-5 animate-spin' />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className='ml-2 w-4 h-4' />
                  </>
                )}
              </Button>
            </form>

            <p className='mt-6 text-center text-sm font-semibold text-muted-foreground'>
              <Link
                href='/'
                className='text-primary underline underline-offset-4 hover:text-primary/85'
              >
                Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordView;
