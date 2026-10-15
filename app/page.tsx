import { createClient } from '@/lib/supabase/server';
import { login, signup } from '@/app/actions';
import PostComposer from '@/app/PostComposer';
import PostItem from '@/app/PostItem';
import Sidebar from '@/app/Sidebar';
import Widgets from '@/app/Widgets';
import MobileNav from '@/app/MobileNav';
import RealtimeFeed from '@/app/RealtimeFeed';
import Link from 'next/link';

interface HomePageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const { tab = 'for-you' } = await searchParams;
  const isFollowingTab = tab === 'following';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  }

  // Base query
  let postsQuery = supabase
    .from('posts')
    .select(`
      id,
      user_id,
      content,
      image_url,
      created_at,
      profiles(username, full_name, upi_id),
      likes(id, user_id),
      comments(
        id,
        user_id,
        content,
        created_at,
        profiles(username, full_name)
      )
    `)
    .order('created_at', { ascending: false });

  // If "Following" tab is active, filter by accounts this user follows
  if (isFollowingTab && user) {
    const { data: followRecords } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = followRecords?.map((f) => f.following_id) || [];
    postsQuery = postsQuery.in('user_id', followingIds.length > 0 ? followingIds : ['00000000-0000-0000-0000-000000000000']);
  }

  const { data: posts } = await postsQuery;
  const postList = posts || [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-gray-100 flex justify-center">
      <div className="w-full max-w-6xl flex justify-between bg-white dark:bg-black border-x border-gray-200 dark:border-neutral-800 min-h-screen">
        <Sidebar user={user} profile={profile} />

        <main className="flex-1 max-w-xl min-h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black pb-20">
          {/* Header with Feed Tabs */}
          <header className="border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10">
            <div className="flex text-sm font-semibold border-t border-transparent">
              <Link
                href="/?tab=for-you"
                className={`flex-1 text-center py-3.5 transition hover:bg-gray-50 dark:hover:bg-neutral-900/50 ${
                  !isFollowingTab
                    ? 'border-b-2 border-black dark:border-white font-bold text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-neutral-400'
                }`}
              >
                For You
              </Link>
              <Link
                href="/?tab=following"
                className={`flex-1 text-center py-3.5 transition hover:bg-gray-50 dark:hover:bg-neutral-900/50 ${
                  isFollowingTab
                    ? 'border-b-2 border-black dark:border-white font-bold text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-neutral-400'
                }`}
              >
                Following
              </Link>
            </div>
          </header>

          {/* Composer or Auth */}
          {user ? (
            <PostComposer />
          ) : (
            <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
              <h2 className="text-base font-semibold mb-2 text-gray-800 dark:text-neutral-200">Sign in to your space</h2>
              <form className="space-y-3">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full p-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded text-sm text-gray-900 dark:text-white"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full p-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded text-sm text-gray-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    formAction={login}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200"
                  >
                    Log In
                  </button>
                  <button
                    formAction={signup}
                    className="flex-1 bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 py-2 rounded text-sm font-semibold hover:bg-gray-300 dark:hover:bg-neutral-700"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts Feed */}
          <RealtimeFeed
            initialPosts={postList}
            currentUserId={user?.id}
            tab={tab}
          />
        </main>

        <Widgets postCount={postList.length} />
      </div>

      <MobileNav currentUsername={profile?.username} />
    </div>
  );
}