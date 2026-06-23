'use client';

import { useState } from 'react';

import { useAuthDialog } from '../stores/auth-dialog';

import { Eye, EyeOff, UserPlus } from 'lucide-react';

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

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignUpDialog = ({ open, onOpenChange }: SignupDialogProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { setSignUpOpen } = useAuthDialog();

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
          <form className='space-y-4' noValidate>
            <div className='space-y-1.5'>
              <Label htmlFor='signup-firstName'>Full Name</Label>
              <Input
                id='signup-firstName'
                type='text'
                placeholder='Your name'
                autoComplete='name'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='signup-email'>Email</Label>
              <Input
                id='signup-email'
                type='email'
                placeholder='you@example.com'
                autoComplete='email'
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
            </div>

            <Button type='submit' className='w-full'>
              Create Account
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpDialog;
