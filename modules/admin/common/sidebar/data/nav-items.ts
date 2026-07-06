import { Bell, LayoutDashboard, LayoutGrid, MessagesSquare, Newspaper, Tag, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Blogs',
    url: '/admin/blogs',
    icon: Newspaper,
  },
  {
    title: 'Categories',
    url: '/admin/categories',
    icon: LayoutGrid,
  },
  {
    title: 'Tags',
    url: '/admin/tags',
    icon: Tag,
  },
  {
    title: 'Comments',
    url: '/admin/comments',
    icon: MessagesSquare,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Notifications',
    url: '/admin/notifications',
    icon: Bell,
  },
];
