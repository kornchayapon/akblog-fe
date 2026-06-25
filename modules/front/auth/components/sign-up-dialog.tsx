'use client';

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthDialogStore } from '../stores/auth-dialog-store';
import { useAuth } from '../hooks/use-auth';

import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  SignUpExtendSchema,
  SignUpFormValues,
} from '../../schemas/auth-schemas';

import { checkAxiosError } from '@/lib/functions/check-axios-error';

import FormFieldError from '../../common/components/form-field-error';
import FormErrorMessage from '../../common/components/form-error-message';

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignUpDialog = ({ open, onOpenChange }: SignupDialogProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setSignUpOpen } = useAuthDialogStore();
  const { actions, status } = useAuth();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpExtendSchema),
  });

  const clearError = () => setErrorMessage(null);

  const onSubmit = async (data: SignUpFormValues) => {
    console.log('submit form', data);

    try {
      await actions.signUp({
        firstName: data.firstName,
        email: data.email,
        password: data.password,
      });

      reset(); // clear form
      setErrorMessage(null);
      setSignUpOpen(false);
    } catch (error: unknown) {
      if (checkAxiosError(error)) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Sign up failed. Please try again.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-md rounded2xl border-border/50 bg-card/95 shadow-2xl 
        shadow-primary/10 backdrop-blur-md'
      >
        <DialogHeader className='items-center pb-2 text-center'>
          <div
            className='mb-3 flex size-12 items-center justify-center rounded-2xl 
            bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-lg 
            shadow-primary/25'
          >
            <UserPlus className='size-5' aria-hidden />
          </div>
          <DialogTitle className='text-xl font-semibold tracking-tight'>
            Create an account
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            Join us to leave reviews and comments on blogs
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5 pt-1'>
          <FormErrorMessage message={errorMessage} />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-4'
            noValidate
          >
            <div className='space-y-1.5'>
              <Label htmlFor='signup-firstName'>Full Name</Label>
              <Input
                id='signup-firstName'
                type='text'
                placeholder='Your name'
                autoComplete='name'
                disabled={status.isSignUpPending}
                {...register('firstName', { onChange: clearError })}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='signup-email'>Email</Label>
              <Input
                id='signup-email'
                type='email'
                placeholder='you@example.com'
                autoComplete='email'
                disabled={status.isSignUpPending}
                {...register('email', { onChange: clearError })}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='signup-password'>Password</Label>
              <div className='relative'>
                <Input
                  id='signup-password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  autoComplete='new-password'
                  className='pr-10'
                  disabled={status.isSignUpPending}
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

            <div className='space-y-1.5'>
              <Label htmlFor='signup-confirmPassword'>Confirm Password</Label>
              <div className='relative'>
                <Input
                  id='signup-confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  autoComplete='new-password'
                  className='pr-10'
                  disabled={status.isSignUpPending}
                  {...register('confirmPassword', { onChange: clearError })}
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none'
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='size-4' />
                  ) : (
                    <Eye className='size-4' />
                  )}
                </button>
              </div>
              <FormFieldError message={errors.confirmPassword?.message} />
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={status.isSignUpPending}
            >
              {status.isSignUpPending ? (
                <Loader2 className='mr-2 size-4 animate-spin' />
              ) : null}
              Create Account
            </Button>
          </form>

          {/* Separator */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-card px-4 font-bold tracking-widest text-muted-foreground'>
                or continue with
              </span>
            </div>
          </div>

          <div className='text-center text-sm text-muted-foreground'>
            Already have an account?{' '}
            <button
              type='button'
              className='font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/85 hover:underline disabled:pointer-events-none disabled:opacity-50'
              disabled={status.isSignUpPending}
            >
              Sign in
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpDialog;
