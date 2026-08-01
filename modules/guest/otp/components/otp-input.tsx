'use client';

import { useRef, useState } from 'react';

import { useAuth } from '@/modules/guest/auth/hooks/use-auth';
import { useUser } from '@/modules/guest/auth/hooks/use-user';

import { Input } from '@/components/ui/input';
import { checkAxiosError } from '@/lib/functions/check-axios-error';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  setErrorMessage: (msg: string | null) => void;
}

const OTP_LENGTH = 6;

export default function OtpInput({
  setErrorMessage,
}: OtpInputProps) {
  const { actions, status } = useAuth();
  const { user } = useUser();

  const [code, setCode] = useState<string[]>(
    Array(OTP_LENGTH).fill(''),
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * ป้องกัน submit ซ้ำ
   */
  const submittedRef = useRef(false);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const submitOtp = async (otp: string) => {
    if (!user?.id) return;
    if (status.isVerifyEmailPending) return;

    submittedRef.current = true;

    try {
      await actions.verifyEmail({
        userId: user.id,
        code: otp,
      });

      // success
      // redirect...
    } catch (error) {
      if (checkAxiosError(error)) {
        const raw = error.response.data?.message;

        const msg = Array.isArray(raw)
          ? raw.join(', ')
          : typeof raw === 'string'
            ? raw
            : null;

        setErrorMessage(
          msg ??
            'Invalid or expired code. Please try again.',
        );
      } else {
        setErrorMessage(
          'OTP verification failed. Please try again.',
        );
      }

      submittedRef.current = false;

      setCode(Array(OTP_LENGTH).fill(''));

      focusInput(0);
    }
  };

  const trySubmit = (digits: string[]) => {
    const complete = digits.every(Boolean);

    if (
      complete &&
      !submittedRef.current &&
      !status.isVerifyEmailPending
    ) {
      void submitOtp(digits.join(''));
    }
  };

  const handleChange = (
    value: string,
    index: number,
  ) => {
    if (!/^\d?$/.test(value)) return;

    const digits = [...code];

    digits[index] = value;

    setCode(digits);

    setErrorMessage(null);

    /**
     * มีการแก้ไขใหม่
     * อนุญาต submit รอบใหม่
     */
    submittedRef.current = false;

    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }

    trySubmit(digits);
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const digits = Array(OTP_LENGTH).fill('');

    pasted.split('').forEach((digit, i) => {
      digits[i] = digit;
    });

    setCode(digits);

    setErrorMessage(null);

    submittedRef.current = false;

    focusInput(
      Math.min(pasted.length, OTP_LENGTH) - 1,
    );

    trySubmit(digits);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    switch (e.key) {
      case 'Backspace':
        if (code[index]) {
          const digits = [...code];
          digits[index] = '';
          setCode(digits);

          submittedRef.current = false;
          return;
        }

        if (index > 0) {
          const digits = [...code];

          digits[index - 1] = '';

          setCode(digits);

          focusInput(index - 1);

          submittedRef.current = false;
        }
        return;

      case 'ArrowLeft':
        if (index > 0) {
          focusInput(index - 1);
        }
        return;

      case 'ArrowRight':
        if (index < OTP_LENGTH - 1) {
          focusInput(index + 1);
        }
        return;

      case 'Home':
        focusInput(0);
        return;

      case 'End':
        focusInput(OTP_LENGTH - 1);
        return;
    }
  };

  return (
    <form
      className="flex justify-center gap-3"
      autoComplete="one-time-code"
    >
      {code.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          disabled={status.isVerifyEmailPending}
          value={digit}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          onFocus={(e) => e.target.select()}
          onPaste={handlePaste}
          onKeyDown={(e) =>
            handleKeyDown(e, index)
          }
          onChange={(e) =>
            handleChange(
              e.target.value.replace(/\D/g, ''),
              index,
            )
          }
          className={cn(
            'z-10 h-14 w-12 rounded-2xl border border-transparent bg-muted text-center text-2xl font-bold transition-all duration-200',
            'focus-visible:scale-[1.06] focus-visible:border-primary/40 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring',
            digit && 'border-primary/30 bg-card',
          )}
        />
      ))}
    </form>
  );
}