'use client';

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInFormValues, SignInSchema } from '../../schemas/auth-schemas';

import { useAuth } from '../hooks/use-auth';
import { useAuthDialogStore } from '../stores/auth-dialog-store';

import FormFieldError from '../../common/components/form-field-error';
import FormErrorMessage from '../../common/components/form-error-message';
import { checkAxiosError } from '@/lib/functions/check-axios-error';
import Link from 'next/link';

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignInDialog = ({ open, onOpenChange }: SignInDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { setSignInOpen, setSignUpOpen } = useAuthDialogStore();
  const { actions, status } = useAuth();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
  });

  const clearError = () => setErrorMessage(null);

  const onSubmit = async (data: SignInFormValues) => {
    try {
      await actions.signIn({ email: data.email, password: data.password });
      reset(); // clear form
      setErrorMessage(null);
      setSignInOpen(false);
    } catch (error: unknown) {
      if (checkAxiosError(error)) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Sign in failed. Please try again.');
      }
    }
  };

  const handleSwitchToSignUp = () => {
    setSignInOpen(false);
    setSignUpOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md rounded-2xl border-border/50 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-md'>
        <DialogHeader className='items-center pb-2 text-center'>
          <div className='mb-3 flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/25'>
            <LogIn className='size-5' aria-hidden />
          </div>
          <DialogTitle className='text-xl font-semibold tracking-tight'>
            Welcome back
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            Sign in to leave reviews and comments
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5 pt-1'>
          <FormErrorMessage message={errorMessage} />

          <form
            className='space-y-4'
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className='space-y-1.5'>
              <Label htmlFor='signin-email'>Email</Label>
              <Input
                id='signin-email'
                type='email'
                placeholder='you@example.com'
                autoComplete='email'
                disabled={status.isSignInPending}
                {...register('email', { onChange: clearError })}
              />
              <FormFieldError message={errors.email?.message} />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='signin-password'>Password</Label>
              <div className='relative'>
                <Input
                  id='signin-password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  autoComplete='current-password'
                  className='pr-10'
                  disabled={status.isSignInPending}
                  {...register('password', { onChange: clearError })}
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none'
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className='size-4' />
                  ) : (
                    <Eye className='size-4' />
                  )}
                </button>
              </div>
              <FormFieldError message={errors.password?.message} />
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={status.isSignInPending}
            >
              {status.isSignInPending ? (
                <Loader2 className='mr-2 size-4 animate-spin' />
              ) : null}
              Sign In
            </Button>
          </form>

          {/* Forgot password */}
          <div className='flex justify-end mr-1'>
            <Button
              variant='link'
              className='h-auto p-0 text-xs font-bold text-primary opacity-80 transition-opacity duration-300 hover:opacity-100'
              asChild
            >
              <Link
                href='/forgot'
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Forgot password?
              </Link>
            </Button>
          </div>

          {/* Switch to Sign Up */}
          <p className='text-center text-sm text-muted-foreground'>
            Don&apos;t have an account?{' '}
            <button
              type='button'
              className='font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/85 hover:underline disabled:pointer-events-none disabled:opacity-50'
              disabled={status.isSignInPending}
              onClick={handleSwitchToSignUp}
            >
              Sign up
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;
