import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Sidebar from '@/app/Sidebar';
import Widgets from '@/app/Widgets';
import MobileNav from '@/app/MobileNav';
import PostItem from '@/app/PostItem';
import { format } from 'date-fns';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toggleFollow } from '@/app/actions';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username).replace('@', '');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentUserProfile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    currentUserProfile = data;
  }

  // Fetch viewed profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', decodedUsername)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  // Fetch follower & following counts
  const [{ count: followerCount }, { count: followingCount }, { data: isFollowingData }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    user
      ? supabase.from('follows').select('id').match({ follower_id: user.id, following_id: profile.id }).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const isFollowing = Boolean(isFollowingData);

  // Fetch user posts with comments and likes
  const { data: posts } = await supabase
    .from('posts')
    .select(`
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
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  const userPosts = posts || [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-gray-100 flex justify-center">
      <div className="w-full max-w-6xl flex justify-between bg-white dark:bg-black border-x border-gray-200 dark:border-neutral-800 min-h-screen">
        <Sidebar user={user} profile={currentUserProfile} />

        <main className="flex-1 max-w-xl min-h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black pb-20">
          <header className="p-4 border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10 flex items-center gap-6">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-5">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                {userPosts.length} posts
              </p>
            </div>
          </header>

          <div className="p-6 border-b border-gray-200 dark:border-neutral-800 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-20 h-20 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-extrabold text-2xl flex items-center justify-center shrink-0">
                {(profile.full_name || profile.username || 'U')[0]?.toUpperCase()}
              </div>

              {/* Follow Button (hidden on own profile) */}
              {user && user.id !== profile.id && (
                <form action={toggleFollow}>
                  <input type="hidden" name="targetUserId" value={profile.id} />
                  <input type="hidden" name="username" value={profile.username} />
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                      isFollowing
                        ? 'border border-gray-300 dark:border-neutral-700 hover:border-red-500 hover:text-red-500 text-gray-800 dark:text-neutral-200'
                        : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </form>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.full_name || 'Member'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                @{profile.username}
              </p>
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
              <Calendar size={14} />
              <span>
                Joined {format(new Date(profile.created_at || Date.now()), 'MMMM yyyy')}
              </span>
            </div>

            <div className="flex items-center gap-5 pt-1 text-sm">
              <div className="flex gap-1.5 items-center">
                <span className="font-bold text-gray-900 dark:text-white">{followingCount || 0}</span>
                <span className="text-gray-500 dark:text-neutral-400">Following</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <span className="font-bold text-gray-900 dark:text-white">{followerCount || 0}</span>
                <span className="text-gray-500 dark:text-neutral-400">Followers</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-neutral-900">
            {userPosts.length > 0 ? (
              userPosts.map((post: any) => (
                <PostItem key={post.id} post={post} currentUserId={user?.id} />
              ))
            ) : (
              <p className="text-center text-gray-400 py-10 text-sm">No updates from this user yet.</p>
            )}
          </div>
        </main>

        <Widgets postCount={userPosts.length} />
      </div>

      <MobileNav />
    </div>
  );
}