'use client';

import { useEffect } from 'react';

import { useHeader } from '../../common/stores/header';
import { NotificationsHistoryView } from '@/modules/notifications/views/notifications-history-view';

export default function NotificationsView() {
  const setTitle = useHeader((s) => s.setTitle);

  useEffect(() => {
    setTitle('Notification History');
  }, [setTitle]);

  return (
    <NotificationsHistoryView title='Notification History' />
  );
}
