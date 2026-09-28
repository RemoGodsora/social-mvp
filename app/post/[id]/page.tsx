import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Sidebar from '@/app/Sidebar';
import Widgets from '@/app/Widgets';
import MobileNav from '@/app/MobileNav';
import PostItem from '@/app/PostItem';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface SinglePostPageProps {
  params: Promise<{ id: string }>;
}

export default async function SinglePostPage({ params }: SinglePostPageProps) {
  const { id } = await params;

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

  // Fetch the target post including author details, likes, and threaded comments
  const { data: post } = await supabase
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
    .eq('id', id)
    .maybeSingle();

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-gray-100 flex justify-center">
      <div className="w-full max-w-6xl flex justify-between bg-white dark:bg-black border-x border-gray-200 dark:border-neutral-800 min-h-screen">
        <Sidebar user={user} profile={profile} />

        <main className="flex-1 max-w-xl min-h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black pb-20">
          {/* Header */}
          <header className="p-4 border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10 flex items-center gap-6">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-850 transition text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Post
            </h1>
          </header>

          {/* Dedicated Post View */}
          <div className="border-b border-gray-100 dark:border-neutral-900">
            <PostItem post={post} currentUserId={user?.id} />
          </div>
        </main>

        <Widgets postCount={1} />
      </div>

      <MobileNav currentUsername={profile?.username} />
    </div>
  );
}