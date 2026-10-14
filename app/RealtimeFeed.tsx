'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PostItem from '@/app/PostItem';
import { useRouter } from 'next/navigation';

interface RealtimeFeedProps {
  initialPosts: any[];
  currentUserId?: string;
}

export default function RealtimeFeed({ initialPosts, currentUserId }: RealtimeFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const supabase = createClient();
  const router = useRouter();

  // Sync state if server props change (e.g., switching between tabs)
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          // Fetch the full post with author profile and relation fields
          const { data: newPost } = await supabase
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
            .eq('id', payload.new.id)
            .single();

          if (newPost) {
            setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts((prev) => prev.filter((post) => post.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (posts.length === 0) {
    return <p className="text-center text-gray-400 py-10 text-sm">No updates yet.</p>;
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-neutral-900">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
}