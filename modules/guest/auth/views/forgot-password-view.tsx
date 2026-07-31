'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { resetPasswordRequest } from '@/lib/apis/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Mail, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

import { toast } from 'sonner';

const schema = z.object({
  email: z.email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

const ForgotPasswordView = () => {
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMessage(null);
    try {
      await resetPasswordRequest({ email: data.email });
      setSent(true);
    } catch (error: unknown) {    
      toast.success('Reset password failed. Please try again.');
      setErrorMessage('Reset password failed. Please try again.');      
      console.log(error);
      
    }
  };

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
              <Mail className='h-8 w-8 text-primary' />
            </div>
            <div className='space-y-2'>
              <h1 className='font-serif text-3xl font-medium italic tracking-tight text-foreground'>
                Forgot Password
              </h1>
              <p className='text-sm font-medium text-muted-foreground'>
                Enter the email you used to sign up and we&apos;ll send you a
                link to reset your password.
              </p>
            </div>
          </div>

          <div className='px-10 pb-10'>
            {sent ? (
              <div className='space-y-6 text-center'>
                <div className='flex justify-center'>
                  <CheckCircle2 className='h-14 w-14 text-primary' />
                </div>
                <div>
                  <p className='font-medium text-foreground'>
                    We have sent a password reset link to
                  </p>
                  <p className='mt-1 font-bold text-foreground'>
                    {getValues('email')}
                  </p>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    Please check your email (including the Spam folder) and click
                    the link to set a new password.
                  </p>
                </div>
                <Button
                  asChild
                  className='h-12 w-full rounded-2xl font-bold'
                >
                  <Link href='/'>
                    Return to Home
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {errorMessage ? (
                  <div className='mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                    {errorMessage}
                  </div>
                ) : null}
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                  <div className='space-y-2'>
                    <Label className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                      Email
                    </Label>
                    <div className='group relative'>
                      <Mail className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary' />
                      <Input
                        type='email'
                        placeholder='your@email.com'
                        className='h-12 rounded-2xl border-0 bg-muted pl-11 focus-visible:ring-2 focus-visible:ring-ring'
                        {...register('email')}
                      />
                    </div>
                    {errors.email ? (
                      <p className='text-xs font-semibold text-destructive'>
                        {errors.email.message}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='h-12 w-full rounded-2xl font-bold shadow-lg shadow-primary/15'
                  >
                    {isSubmitting ? (
                      <Loader2 className='h-5 w-5 animate-spin' />
                    ) : (
                      <>
                        Send password reset link
                        <ArrowRight className='ml-2 h-4 w-4' />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

            <p className='mt-6 text-center text-sm font-semibold text-muted-foreground'>
              Remember your password?{' '}
              <Link
                href='/'
                className='text-primary underline underline-offset-4 hover:text-primary/85'
              >
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordView;
