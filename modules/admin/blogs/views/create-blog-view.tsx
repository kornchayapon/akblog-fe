'use client';

import { useRouter } from 'next/navigation';

import { startTransition, useEffect, useRef, useState } from 'react';

import TagsInput, { TagsState } from '../../common/components/tags-input';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateBlogFormValues, CreateBlogSchema } from '../schemas/blog-schema';

import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import { editorObject } from '../../common/objects/editor';

import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query/query-client';

import {
  ADMIN_BLOGS_KEY,
  ADMIN_CATEGORIES_KEY,
} from '@/lib/constants/query-key';
import { fetchTags } from '@/lib/apis/tags';
import { fetchCategories } from '@/lib/apis/categories';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { Loader2 } from 'lucide-react';

import { SubmitBlogSkeleton } from '../components/submit-blog-skeleton';
import ErrorCard from '../../common/components/error-card';
import SavePending from '../components/save-pending';
import BreadcrumbNav, {
  BreadcrumbNavItem,
} from '../../common/components/breadcrumb-nav';
import FormErrorMessage from '@/modules/guest/common/components/form-error-message';
import FormFieldError from '@/modules/guest/common/components/form-field-error';
import SelectOptions, {
  SelectOption,
} from '../../common/components/select-options';
import UploadThumbnail from '../../common/components/upload-thumbnail';
import UploadPictures from '../../common/components/upload-pictures';

import { Category } from '@/lib/interfaces/category';
import { createBlog, CreateBlogPayload } from '@/lib/apis/blogs';
import { handleApiError } from '@/lib/functions/handle-api-error';
import { Picture } from '@/lib/interfaces/picture';
import { uploadPictures } from '@/lib/apis/pictures';


const navItems: BreadcrumbNavItem[] = [
  { href: '/admin', children: 'Home', type: 'link' },
  { href: '/admin/blogs', children: 'Blogs', type: 'link' },
  { href: '', children: 'Create Blog', type: 'page' },
];

const CreateBlogView = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Picture[]>([]);
  const [tags, setTags] = useState<TagsState[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    control,
    formState: { errors, isDirty },
  } = useForm<CreateBlogFormValues>({
    resolver: zodResolver(CreateBlogSchema),
    defaultValues: {
      title: '',
      category: null,
    },
  });

  useEffect(() => {
    if (isDirty) {
      startTransition(() => {
        setErrorMessage(null);
      });
    }
  }, [isDirty]);

  const editorRef = useRef<TinyMCEEditor | null>(null);

  // Query categories
  const {
    data: categoriesData,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery({
    queryKey: [ADMIN_CATEGORIES_KEY],
    queryFn: () => fetchCategories(),
    staleTime: 5000,
  });

  // Query tags
  const {
    data: tagsData,
    isPending: isTagsPending,
    isError: isTagsError,
    error: tagsError,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: () => fetchTags(),
    staleTime: 5000,
  });

  const router = useRouter();

  // create blog
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: CreateBlogPayload) => createBlog({ payload }),
    onSuccess: () => {
      toast.success('Create blog successfully');
      queryClient.invalidateQueries({ queryKey: [ADMIN_BLOGS_KEY] });
      reset();
      router.push('/admin/blogs');
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        err.response?.data?.message ||
        err.message ||
        'Create blog error (mutation)';

      setErrorMessage(message);
      reset(getValues());

      toast.error('Blog not created, ' + message);
    },
  });

  // Upload Mutation
  const uploadThumbnailMutation = useMutation({
    mutationFn: (file: File) => uploadPictures([file]),
    onSuccess: (data: Picture[]) => {
      const image = data[0];
      if (image) {
        setErrorMessage(null);
        submitBlog(image.id);
      }
    },
    onError: (error) => {
      handleApiError(error, 'Upload thumbnail error!');
    },
  });

  const handleInsertImage = (imagePath: string) => {
    if (editorRef.current) {
      editorRef.current.insertContent(
        `<img src="${imagePath}" alt="Inserted Image" style="max-width: 100%; height: auto;" />`,
      );
    }
  };

  const submitBlog = (thumbnailId: number | null) => {
    const values = getValues();
    const payload: CreateBlogPayload = {
      ...values,
      category: values.category || 0,
      content: editorRef.current?.getContent() || '',
      thumbnail: thumbnailId,
      pictures: uploadedFiles.map((pic) => pic.id),
      tags: tags.map((tag) => tag.id),
    };

    mutate(payload);
  };

  const onSubmit = () => {
    if (thumbnailFile) {
      uploadThumbnailMutation.mutate(thumbnailFile);
    } else {
      // no image
      submitBlog(null);
    }
  };

  let content: React.ReactNode;

  if (isCategoriesPending || isTagsPending) {
    content = <SubmitBlogSkeleton />;
  }

  if (isCategoriesError || isTagsError) {
    const title = 'An error occurred';

    let message: string = '';

    if (categoriesError?.message) {
      message += categoriesError?.message;
    }

    if (tagsError?.message) {
      message += tagsError?.message;
    }

    content = <ErrorCard title={title} message={message} />;
  }

  if (categoriesData && tagsData) {
    content = (
      <div className='min-w-0 max-w-full p-6'>
        <SavePending isSaving={isPending} message='Create blog ...' />

        <div className='font-bold'>Create Blog</div>
        <div className='pt-4'>
          <BreadcrumbNav navItems={navItems} />
        </div>
        <div className='pt-10 flex flex-col gap-6'>
          <FormErrorMessage message={errorMessage} />
          <form
            onSubmit={(event) => handleSubmit(onSubmit)(event)}
            className={`grid gap-4 ${
              isPending ? 'pointer-events-none opacity-70' : ''
            }`}
          >
            <div className='grid gap-3'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                {...register('title')}
                disabled={isPending}
                placeholder='Blog title'
              />
              <FormFieldError message={errors.title?.message} />
            </div>

            <div className='grid md:grid-cols-2 gap-4'>
              <div className='grid border p-3 rounded-xl shadow'>
                <div className='flex flex-col gap-3'>
                  <Label htmlFor='category'>Category</Label>
                  {/* Use Controller to wrap custom Select component */}
                  <Controller
                    name='category'
                    control={control}
                    render={({ field }) => {
                      const options: SelectOption<number>[] =
                        categoriesData.results?.map((cat: Category) => ({
                          value: cat.id,
                          label: cat.name,
                        })) || [];

                      return (
                        <SelectOptions
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isPending}
                          options={options}
                          id='category'
                          placeholder='Select a category'
                        />
                      );
                    }}
                  />
                  <FormFieldError message={errors.category?.message} />
                </div>
              </div>
              <div className='grid gap-3'>
                {/* Upload Component */}
                <UploadThumbnail
                  uploadMutation={uploadThumbnailMutation}
                  setSelectedFile={setThumbnailFile}
                />
              </div>
            </div>

            {/* Tags Input */}
            <TagsInput
              tags={tags}
              setTags={setTags}
              oldTags={tagsData.results ?? []}
              disabled={isTagsPending}
            />

            {/* Upload Pictures */}
            <UploadPictures
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              onInsert={handleInsertImage}
            />

            <div className='pt-5'>
              <Editor
                apiKey='6d3pasku44nahcik10j1cth0ud907iocsavx2rh0su6ik8sr'
                onInit={(_evt, editor) => (editorRef.current = editor)}
                initialValue='<p>Your content ...</p>'
                init={editorObject}
              />
            </div>
            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                type='button'
                disabled={isPending}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type='submit'>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return content;
};

export default CreateBlogView;
