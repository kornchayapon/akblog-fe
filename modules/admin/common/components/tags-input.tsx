'use client';

import React, { useState, KeyboardEvent } from 'react';

import { useMutation } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

import { createTag, CreateTagPayload } from '@/lib/apis/tags';
import { toast } from 'sonner';

import { queryClient } from '@/lib/react-query/query-client';

export type TagsState = {
  id: number;
  name: string;
};

interface TagsInputProps {
  tags: TagsState[];
  setTags: React.Dispatch<React.SetStateAction<TagsState[]>>;
  oldTags: TagsState[];
  disabled: boolean;
}

const TagsInput = ({ tags, setTags, oldTags, disabled }: TagsInputProps) => {
  const [value, setValue] = useState('');

  const createTagMutation = useMutation({
    mutationFn: (payload: CreateTagPayload) => createTag({ payload }),
    onSuccess: () => {
      // toast.success('Tags created successfully');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        err.response?.data?.message ||
        err.message ||
        'Create tag error (mutation)';

      toast.error('Tag not created, ' + message);
    },
  });

  const normalizeTag = (value: string) => value.trim().toLowerCase();

  const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();

    // check repeat
    if(tags.find(
      (el) => normalizeTag(el.name) === normalizeTag(value),
    )) {
      setValue('');
      return;
    }

    // console.log('repeat', repeat);

    const normalized = normalizeTag(value);
    if (!normalized) return;

    // const input = value.trim();
    // if (!input) return;

    // protect loop input
    if (tags.some((t) => t.name === normalized)) {
      setValue('');
      return;
    }

    // find in oldTags
    const found = oldTags.find((t) => normalizeTag(t.name) === normalized);

    if (found) {
      setTags((prev) => [...prev, found]);
    } else {
      // create new tag
      const payload: CreateTagPayload = {
        name: normalized,
      };
      const newTag = await createTagMutation.mutateAsync(payload);
      setTags((prev) => [...prev, newTag]);
    }

    setValue('');
  };

  const removeTag = (id: number) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-md border p-2'>
      {tags &&
        tags.map((tag) => (
          <Badge key={tag.id} variant='secondary' className='gap-1'>
            {capitalize(tag.name)}
            <button onClick={() => removeTag(tag.id)}>
              <X className='h-3 w-3' />
            </button>
          </Badge>
        ))}

      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Type and TAB'
        className='w-auto min-w-[120px] border-none shadow-none focus-visible:ring-0'
        disabled={disabled}
      />
    </div>
  );
};

export default TagsInput;
