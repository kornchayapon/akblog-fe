import ResetPasswordView from '@/modules/guest/auth/views/reset-password-view';

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

const ResetPasswordPage = async ({ params }: ResetPasswordPageProps) => {
  const { token } = await params;
  return <ResetPasswordView token={token} />;
};

export default ResetPasswordPage;