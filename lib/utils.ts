import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const isNavItemActive = (
  pathname: string,
  itemHref: string,
): boolean => {
  return (
    pathname === itemHref || (itemHref !== '/' && pathname.startsWith(itemHref))
  );
};
