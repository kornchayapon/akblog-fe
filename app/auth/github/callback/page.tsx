'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useAuth } from '@/modules/guest/auth/hooks/use-auth';

import { UserRole } from '@/lib/enums/user-role.enum';
import { checkAxiosError } from '@/lib/functions/check-axios-error';

function GithubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { actions, status } = useAuth();

  const [error, setError] = useState<string | null>(null);

  /**
   * Prevent React StrictMode double invoke
   */
  const hasStartedRef = useRef(false);

  const code = searchParams.get('code');

  const signIn = useCallback(async () => {
    if (!code) {
      setError('GitHub code not found. Please try again.');
      return;
    }

    try {
      const redirectUri =
        `${window.location.origin}/auth/github/callback`;

      const data = await actions.githubSignin({
        code,
        redirectUri,
      });

      if (data.user.role === UserRole.ADMIN) {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    } catch (error) {
      if (checkAxiosError(error)) {
        const raw = error.response.data?.message;

        const message = Array.isArray(raw)
          ? raw.join(', ')
          : typeof raw === 'string'
            ? raw
            : 'GitHub sign-in failed. Please try again.';

        setError(message);
      } else {
        setError('GitHub sign-in failed. Please try again.');
      }
    }
  }, [actions, code, router]);

  useEffect(() => {
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;

    void signIn();
  }, [signIn]);

  const isLoading =
    status.isGithubSigninPending && !error;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-3xl border-border/60 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Connect your GitHub Account
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {isLoading && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-center text-sm text-muted-foreground">
                Verifying your identity with GitHub...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-red-200/80 bg-red-50/80 p-4 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => router.replace('/')}
                >
                  Back to Home
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <p className="text-center text-sm text-muted-foreground">
              Preparing your account...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center px-4">
          <Card className="w-full max-w-md rounded-3xl border-border/60 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-md">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading...
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <GithubCallbackContent />
    </Suspense>
  );
}