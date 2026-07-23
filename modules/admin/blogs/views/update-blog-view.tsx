'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateBlogFormValues, UpdateBlogSchema } from '../schemas/blog-schema';
import { Controller, useForm } from 'react-hook-form';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ADMIN_BLOGS_KEY,
  ADMIN_CATEGORIES_KEY,
} from '@/lib/constants/query-key';
import { fetchCategories } from '@/lib/apis/categories';
import { fetchTags } from '@/lib/apis/tags';
import { queryClient } from '@/lib/react-query/query-client';

import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import { editorObject } from '../../common/objects/editor';

import { toast } from 'sonner';

import { SubmitBlogSkeleton } from '../components/submit-blog-skeleton';
import ErrorCard from '../../common/components/error-card';
import FormFieldError from '@/modules/guest/common/components/form-field-error';
import SelectOptions, {
  SelectOption,
} from '../../common/components/select-options';
import TagsInput, { TagsState } from '../../common/components/tags-input';
import BreadcrumbNav, {
  BreadcrumbNavItem,
} from '../../common/components/breadcrumb-nav';
import SavePending from '../components/save-pending';
import FormErrorMessage from '@/modules/guest/common/components/form-error-message';
import ImageView from '../../common/components/image-view';
import UploadThumbnail from '../../common/components/upload-thumbnail';
import UploadPictures from '../../common/components/upload-pictures';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Loader2 } from 'lucide-react';

import { Category } from '@/lib/interfaces/category';
import { fetchBlog, updateBlog, UpdateBlogPayload } from '@/lib/apis/blogs';
import { Picture } from '@/lib/interfaces/picture';
import { handleApiError } from '@/lib/functions/handle-api-error';
import { uploadPictures } from '@/lib/apis/pictures';

const navItems: BreadcrumbNavItem[] = [
  { href: '/admin', children: 'Home', type: 'link' },
  { href: '/admin/blogs', children: 'Blogs', type: 'link' },
  { href: '', children: 'Update Blog', type: 'page' },
];

interface UpdateBlogViewProps {
  blogId: string;
}

export type Thumbnail = {
  id: number | null;
  path: string | null;
  file: File | null;
};

const UpdateBlogView = ({ blogId }: UpdateBlogViewProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Picture[]>([]);
  const [thumbnail, setThumbnail] = useState<Thumbnail>({
    id: null,
    path: null,
    file: null,
  });
  const [tags, setTags] = useState<TagsState[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    control,
    formState: { errors, isDirty },
  } = useForm<UpdateBlogFormValues>({
    resolver: zodResolver(UpdateBlogSchema),
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

  // get blog
  const {
    data: blogData,
    isPending: isBlogPending,
    isError: isBlogError,
    error: blogError,
  } = useQuery({
    queryKey: [ADMIN_BLOGS_KEY, blogId],
    queryFn: ({ signal }) => fetchBlog({ blogId: parseInt(blogId), signal }),
  });

  const editorRef = useRef<TinyMCEEditor | null>(null);

  // query categories
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

  useEffect(() => {
    if (blogData && categoriesData) {
      reset({
        title: blogData.title,
        category: blogData.category.id,
      });

      // thumbnail
      if (blogData.thumbnail) {
        const thumbnailData = blogData.thumbnail;
        startTransition(() => {
          setThumbnail({
            id: thumbnailData.id,
            path: thumbnailData.path,
            file: null,
          });
        });
      }

      // upload pictures
      const { pictures } = blogData;
      if (pictures && pictures.length) {
        startTransition(() => {
          setUploadedFiles(pictures);
        });
      }

      // tags
      const { tags } = blogData;
      if (tags && tags.length) {
        startTransition(() => {
          setTags(tags);
        });
      }
    }
  }, [blogData, reset, categoriesData]);

  const router = useRouter();

  // update blog
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: UpdateBlogPayload) => updateBlog({ payload }),
    onSuccess: () => {
      toast.success('Update blog successfully');
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
        'Update blog error (mutation)';

      setErrorMessage(message);
      reset(getValues());

      toast.error('Blog not updated, ' + message);
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

  const submitBlog = (thumbnailId: number | null) => {
    const values = getValues();
    const payload: UpdateBlogPayload = {
      ...values,
      blogId: parseInt(blogId),
      category: values.category || 0,
      content: editorRef.current?.getContent() || '',
      thumbnail: thumbnailId,
      pictures: uploadedFiles.map((pic) => pic.id),
      tags: tags.map((tag) => tag.id),
    };

    mutate(payload);
  };

  const onSubmit = () => {
    if (thumbnail.file) {
      uploadThumbnailMutation.mutate(thumbnail.file);
    } else {
      // no image
      submitBlog(null);
    }
  };

  const handleInsertImage = (imagePath: string) => {
    if (editorRef.current) {
      editorRef.current.insertContent(
        `<img src="${imagePath}" alt="Inserted Image" style="max-width: 100%; height: auto;" />`,
      );
    }
  };

  const isSaving = isPending || uploadThumbnailMutation.isPending;

  let content: React.ReactNode;

  if (isCategoriesPending || isBlogPending || isTagsPending) {
    content = <SubmitBlogSkeleton />;
  }

  if (isCategoriesError || isBlogError || isTagsError) {
    const title = 'An error occurred';

    let message: string = '';

    if (categoriesError?.message) {
      message += categoriesError?.message;
    }

    if (blogError?.message) {
      message += blogError?.message;
    }

    if (tagsError?.message) {
      message += tagsError?.message;
    }

    content = <ErrorCard title={title} message={message} />;
  }

  if (categoriesData && blogData && tagsData) {
    content = (
      <div className='min-w-0 max-w-full p-6'>
        <SavePending isSaving={isSaving} message='Update blog ...' />

        <div className='font-bold'>Update Blog</div>
        <div className='pt-4'>
          <BreadcrumbNav navItems={navItems} />
        </div>
        <div className='pt-10 flex flex-col gap-6'>
          <FormErrorMessage message={errorMessage} />
          <form
            // onSubmit={handleSubmit(onSubmit)}
            onSubmit={(event) => handleSubmit(onSubmit)(event)}
            className={`grid gap-4 ${
              isSaving ? 'pointer-events-none opacity-70' : ''
            }`}
          >
            <div className='grid gap-3'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                {...register('title')}
                disabled={isSaving}
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
                          disabled={isSaving}
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
                {/* Upload Thumbnail Component */}
                {thumbnail.id && thumbnail.path ? (
                  <div className='w-full p-6 space-y-4 border rounded-lg shadow-sm'>
                    <div className='text-sm font-medium'>Upload Thumbnail</div>
                    <div className='xl:w-75'>
                      <ImageView
                        imageId={thumbnail.id}
                        imagePath={thumbnail.path}
                        clearUpload={() => {
                          setThumbnail({
                            id: null,
                            path: null,
                            file: null,
                          });
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <UploadThumbnail
                    uploadMutation={uploadThumbnailMutation}
                    setSelectedFile={(file) =>
                      setThumbnail((prev) => ({ ...prev, file }))
                    }
                  />
                )}
              </div>
            </div>

            {/* Upload Pictures */}
            <UploadPictures
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              onInsert={handleInsertImage}
            />

            {/* Tags Input */}
            <TagsInput
              tags={tags}
              setTags={setTags}
              oldTags={tagsData.results ?? []}
              disabled={isTagsPending}
            />

            <div className='pt-5'>
              <Editor
                key={blogData.id}
                apiKey='6d3pasku44nahcik10j1cth0ud907iocsavx2rh0su6ik8sr'
                onInit={(_evt, editor) => (editorRef.current = editor)}
                initialValue={blogData.content ?? ''}
                init={editorObject}
              />
            </div>
            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                type='button'
                disabled={isSaving}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type='submit'>
                {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
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

export default UpdateBlogView;
