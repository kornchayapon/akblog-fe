'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useUser } from '@/modules/guest/auth/hooks/use-user';
import { useAuth } from '@/modules/guest/auth/hooks/use-auth';
import { checkAxiosError } from '@/lib/functions/check-axios-error';

import { Button } from '@/components/ui/button';
import { Mail, Clock, Loader2, RefreshCcw } from 'lucide-react';

import OtpSkeleton from './otp-views-skeleton';
import OtpInput from '../components/otp-input';

const OtpView = () => {
  const { user, isLoading } = useUser();
  const { actions, status } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasHandledVerifiedRef = useRef(false);

  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    if (!user) {
      router.push('/');
      return;
    }
    if (user.verified && !hasHandledVerifiedRef.current) {
      hasHandledVerifiedRef.current = true;
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleResend = async () => {
    if (!user?.id) return;
    try {
      await actions.resendOTP({ userId: user.id });
      setErrorMessage(null);
    } catch (err: unknown) {
      if (checkAxiosError(err)) {
        setErrorMessage(
          err.response.data.message ?? 'Could not resend verification code.'
        );
        return;
      }
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      );
    }
  };

  if (isLoading || !user) {
    return <OtpSkeleton />;
  }

  if (user.verified) {
    return (
      <div className='relative flex min-h-screen items-center justify-center bg-background px-4 py-12'>
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='absolute -right-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/6 blur-[120px]' />
          <div className='absolute -bottom-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-[120px]' />
        </div>
        <div className='w-full max-w-md text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
          <p className='text-lg font-bold text-foreground'>
            Redirecting to the home page
          </p>
          <p className='mt-2 text-sm text-muted-foreground'>
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center bg-background px-4 py-12'>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -right-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/6 blur-[120px]' />
        <div className='absolute -bottom-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-[120px]' />
      </div>

      <div className='relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <div className='overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-2xl shadow-primary/10'>
          <div className='space-y-4 p-10 pb-6 text-center'>
            <div className='mx-auto mb-2 flex h-16 w-16 animate-bounce items-center justify-center rounded-3xl bg-primary/10'>
              <Mail className='h-8 w-8 text-primary' />
            </div>

            <div className='space-y-2'>
              <h1 className='font-serif text-3xl font-medium italic tracking-tight text-foreground'>
                Verify your identity
              </h1>
              <p className='px-4 text-sm font-medium leading-relaxed text-muted-foreground'>
                We have sent a 6-digit code to{' '}
                <span className='font-bold text-foreground'>{user.email}</span>
              </p>
            </div>
          </div>

          <div className='space-y-8 px-10 pb-10'>
            {/* OTP input section */}
            <div className='flex flex-col items-center space-y-2'>
              <OtpInput setErrorMessage={setErrorMessage} />
              <div className='mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground'>
                <Clock className='w-3.5 h-3.5' />
                <span>The verification code will expire within 24 hours</span>
              </div>
            </div>

            {errorMessage && (
              <div className='p-4 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/50 animate-in fade-in slide-in-from-top-2 duration-300'>
                {errorMessage}
              </div>
            )}

            <div className='space-y-4'>
              <p className='text-center text-sm font-semibold text-muted-foreground'>
                Didn&apos;t receive the code?
              </p>

              <Button
                variant='outline'
                className='group h-14 w-full rounded-2xl border-border bg-muted font-medium text-foreground transition-all hover:border-primary/30 hover:bg-card'
                disabled={
                  status.isResendOTPLoading || status.isVerifyEmailPending
                }
                onClick={handleResend}
              >
                {status.isResendOTPLoading || status.isVerifyEmailPending ? (
                  <Loader2 className='w-5 h-5 animate-spin' />
                ) : (
                  <>
                    <RefreshCcw className='mr-2 w-4 h-4 group-hover:rotate-180 transition-transform duration-500' />
                    Resend the code
                  </>
                )}
              </Button>

              <div className='pt-2'>
                <Button
                  variant='link'
                  className='w-full font-semibold text-muted-foreground transition-colors hover:text-primary'
                  onClick={() => router.push('/')}
                >
                  Back to home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpView;
