export function isNavItemActive(pathname: string, itemHref: string): boolean {
  return (
    pathname === itemHref ||
    (itemHref !== '/' && pathname.startsWith(itemHref))
  );
}
