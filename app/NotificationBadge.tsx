'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    // 1. Initial count fetch
    const fetchInitialCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .match({ recipient_id: user.id, is_read: false });

      if (isMounted) {
        setUnreadCount(count || 0);
      }
    };

    fetchInitialCount();

    // 2. Realtime listener setup (created synchronously)
    const channelId = `badge-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user || !isMounted) return;

          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .match({ recipient_id: user.id, is_read: false });

          if (isMounted) {
            setUnreadCount(count || 0);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user || !isMounted) return;

          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .match({ recipient_id: user.id, is_read: false });

          if (isMounted) {
            setUnreadCount(count || 0);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (unreadCount <= 0) return null;

  return (
    <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full animate-in fade-in zoom-in duration-150">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}