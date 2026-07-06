'use client';

interface FormErrorMessageProps {
  message: string | null;
}

const FormErrorMessage = ({ message }: FormErrorMessageProps) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-2 duration-300 dark:border-destructive/30 dark:bg-destructive/10"
    >
      <span className="mt-px leading-snug">{message}</span>
    </div>
  );
};

export default FormErrorMessage;
