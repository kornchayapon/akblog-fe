'use client';

import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ErrorCardProps {
  title: string;
  message: string;
}

const ErrorCard = ({ title, message } : ErrorCardProps) => {
  return (
    <div className='p-5'>
      <Card className='border-red-500/50 bg-red-50'>
        <CardHeader className='flex flex-row items-center gap-2'>
          <AlertTriangle className='text-red-500' />
          <CardTitle className='text-red-700'>{title}</CardTitle>
        </CardHeader>
        <CardContent className='text-red-600'>{message}</CardContent>
      </Card>
    </div>
  );
};

export default ErrorCard;
