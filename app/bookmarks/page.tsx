import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/app/Sidebar';
import Widgets from '@/app/Widgets';
import MobileNav from '@/app/MobileNav';
import PostItem from '@/app/PostItem';
import { Bookmark } from 'lucide-react';

export default async function BookmarksPage() {
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

  // Fetch bookmarked posts joined with post details
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select(`
      id,
      created_at,
      posts (
        id,
        user_id,
        content,
        image_url,
        created_at,
        profiles(username, full_name),
        likes(id, user_id),
        comments(
          id,
          user_id,
          content,
          created_at,
          profiles(username, full_name)
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const bookmarkedPosts = (bookmarks || [])
    .map((b: any) => b.posts)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-gray-100 flex justify-center">
      <div className="w-full max-w-6xl flex justify-between bg-white dark:bg-black border-x border-gray-200 dark:border-neutral-800 min-h-screen">
        <Sidebar user={user} profile={profile} />

        <main className="flex-1 max-w-xl min-h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black pb-20">
          <header className="p-4 border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10">
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Bookmarks
            </h1>
            <p className="text-xs text-gray-400 dark:text-neutral-500">
              @{profile?.username}
            </p>
          </header>

          <div className="divide-y divide-gray-100 dark:divide-neutral-900">
            {bookmarkedPosts.length > 0 ? (
              bookmarkedPosts.map((post: any) => (
                <PostItem
                  key={post.id}
                  post={post}
                  currentUserId={user.id}
                  isBookmarked={true}
                />
              ))
            ) : (
              <div className="p-10 text-center text-gray-400 dark:text-neutral-500 space-y-2">
                <Bookmark className="mx-auto" size={32} />
                <p className="text-sm">You haven&apos;t saved any posts to your bookmarks yet.</p>
              </div>
            )}
          </div>
        </main>

        <Widgets postCount={bookmarkedPosts.length} />
      </div>

      <MobileNav currentUsername={profile?.username} />
    </div>
  );
}