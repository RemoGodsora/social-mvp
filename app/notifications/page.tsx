import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/app/Sidebar';
import Widgets from '@/app/Widgets';
import MobileNav from '@/app/MobileNav';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Fetch notifications joined with actor profile details
  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
      id,
      type,
      is_read,
      created_at,
      post_id,
      profiles:actor_id (
        username,
        full_name
      )
    `)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false });

  const notificationList = notifications || [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-gray-100 flex justify-center">
      <div className="w-full max-w-6xl flex justify-between bg-white dark:bg-black border-x border-gray-200 dark:border-neutral-800 min-h-screen">
        <Sidebar user={user} profile={profile} />

        <main className="flex-1 max-w-xl min-h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black pb-20">
          <header className="p-4 border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10">
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Notifications
            </h1>
          </header>

          <div className="divide-y divide-gray-100 dark:divide-neutral-900">
            {notificationList.length > 0 ? (
              notificationList.map((item: any) => {
                const actor = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
                const timeAgo = formatDistanceToNowStrict(new Date(item.created_at), { addSuffix: true });

                return (
                  <div key={item.id} className="p-4 flex items-start gap-3.5 hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition">
                    <div className="pt-1">
                      {item.type === 'like' && <Heart size={18} className="fill-red-500 text-red-500" />}
                      {item.type === 'comment' && <MessageCircle size={18} className="text-sky-500" />}
                      {item.type === 'follow' && <UserPlus size={18} className="text-emerald-500" />}
                    </div>

                    <div className="flex-1 text-sm space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link href={`/${actor?.username}`} className="font-semibold hover:underline text-gray-900 dark:text-white">
                          {actor?.full_name || actor?.username || 'Someone'}
                        </Link>
                        <span className="text-gray-600 dark:text-neutral-400">
                          {item.type === 'like' && 'liked your post'}
                          {item.type === 'comment' && 'replied to your post'}
                          {item.type === 'follow' && 'followed you'}
                        </span>
                        <span className="text-gray-300 dark:text-neutral-700">·</span>
                        <span suppressHydrationWarning className="text-xs text-gray-400 dark:text-neutral-500">
                          {timeAgo}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-gray-400 dark:text-neutral-500 space-y-2">
                <Bell className="mx-auto" size={32} />
                <p className="text-sm">No notifications yet.</p>
              </div>
            )}
          </div>
        </main>

        <Widgets postCount={notificationList.length} />
      </div>

      <MobileNav currentUsername={profile?.username} />
    </div>
  );
}