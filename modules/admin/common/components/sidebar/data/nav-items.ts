import {
  IconArticle,
  IconBell,
  IconCategory,
  IconDashboard,
  IconMessage,
  IconTag,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';

export interface NavItem {
  title: string;
  url: string;
  icon?: Icon;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: IconDashboard,
  },
  {
    title: 'Blogs',
    url: '/admin/blogs',
    icon: IconArticle,
  },
  {
    title: 'Categories',
    url: '/admin/categories',
    icon: IconCategory,
  },
  {
    title: 'Tags',
    url: '/admin/tags',
    icon: IconTag,
  },
  {
    title: 'Comments',
    url: '/admin/comments',
    icon: IconMessage,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: IconUsers,
  },
  {
    title: 'Notifications',
    url: '/admin/notifications',
    icon: IconBell,
  },
];
