import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/app/Sidebar';
import Widgets from '@/app/Widgets';
import MobileNav from '@/app/MobileNav';
import PostItem from '@/app/PostItem';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface ExplorePageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q = '' } = await searchParams;
  const query = q.trim();

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

  // 1. Search matching profiles
  let matchedProfiles: any[] = [];
  if (query) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, bio')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(5);
    matchedProfiles = profiles || [];
  }

  // 2. Search matching posts
  let matchedPosts: any[] = [];
  if (query) {
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
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false });
    matchedPosts = posts || [];
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-gray-100 flex justify-center">
      <div className="w-full max-w-6xl flex justify-between bg-white dark:bg-black border-x border-gray-200 dark:border-neutral-800 min-h-screen">
        <Sidebar user={user} profile={currentUserProfile} />

        <main className="flex-1 max-w-xl min-h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black pb-20">
          <header className="p-4 border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10">
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              {query ? `Results for "${query}"` : 'Explore'}
            </h1>
          </header>

          {!query ? (
            <div className="p-8 text-center text-gray-400 dark:text-neutral-500 space-y-2">
              <Search className="mx-auto" size={32} />
              <p className="text-sm">Search for posts, tags, or usernames using the search bar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Matched Accounts */}
              {matchedProfiles.length > 0 && (
                <div className="p-4 border-b border-gray-100 dark:border-neutral-900 space-y-3">
                  <h2 className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                    People
                  </h2>
                  <div className="space-y-2">
                    {matchedProfiles.map((p) => (
                      <Link
                        key={p.id}
                        href={`/${p.username}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-900 transition"
                      >
                        <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold flex items-center justify-center shrink-0">
                          {(p.full_name || p.username || 'U')[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                            {p.full_name || 'Member'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-neutral-500 truncate">
                            @{p.username}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Posts */}
              <div className="divide-y divide-gray-100 dark:divide-neutral-900">
                {matchedPosts.length > 0 ? (
                  matchedPosts.map((post) => (
                    <PostItem key={post.id} post={post} currentUserId={user?.id} />
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-10 text-sm">
                    No posts matched &quot;{query}&quot;.
                  </p>
                )}
              </div>
            </div>
          )}
        </main>

        <Widgets postCount={matchedPosts.length} />
      </div>

      <MobileNav currentUsername={currentUserProfile?.username} />
    </div>
  );
}