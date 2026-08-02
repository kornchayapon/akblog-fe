import { Button } from '@/components/ui/button';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface SocialSigninProps {
    isAuthPending: boolean;
}

const SocialSignin = ({ isAuthPending }: SocialSigninProps) => {
  const handleGoogleSignin = () => {
    window.location.href = '/auth/google/start';
  };
  const handleGithubSignin = () => {
    window.location.href = '/auth/github/start';
  };

  return (
    <div className='grid grid-cols-2 gap-4'>
      <Button
        variant='outline'
        disabled={isAuthPending}
        className='h-12 rounded-2xl border-border font-bold transition-all hover:bg-muted'
        type='button'
        onClick={handleGoogleSignin}
      >
        <FcGoogle className='mr-2 w-5 h-5' /> Google
      </Button>
      <Button
        variant='outline'
        disabled={isAuthPending}
        className='h-12 rounded-2xl border-border font-bold transition-all hover:bg-muted'
        type='button'
        onClick={handleGithubSignin}
      >
        <FaGithub className='mr-2 h-5 w-5 text-foreground' />{' '}
        Github
      </Button>
    </div>
  );
};

export default SocialSignin;
