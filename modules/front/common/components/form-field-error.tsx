'use client';

interface FormFieldErrorProps {
  message: string | undefined | null;
}

const FormFieldError = ({ message }: FormFieldErrorProps) => {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="ml-0.5 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
    >
      {message}
    </p>
  );
};

export default FormFieldError;