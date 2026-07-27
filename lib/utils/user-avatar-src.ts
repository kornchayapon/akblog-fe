import type { Picture } from '@/lib/interfaces/picture';

export type AvatarSourceFields = Readonly<{
  avatar?: Picture | null;
}>;

/**
 * Accept only Cloudinary URLs from uploaded profile pictures.
 */
export function getUserAvatarSrc(user: AvatarSourceFields): string {
  const fromPicture = user.avatar?.path?.trim();
  if (fromPicture && /^https?:\/\/res\.cloudinary\.com\//i.test(fromPicture)) {
    return fromPicture;
  }
  return '';
}
