'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PostItem from '@/app/PostItem';
import { useRouter } from 'next/navigation';
import EmptyState from '@/app/EmptyState';
import { Sparkles, Users } from 'lucide-react';

interface RealtimeFeedProps {
  initialPosts: any[];
  currentUserId?: string;
  tab?: string;
}

export default function RealtimeFeed({ initialPosts, currentUserId, tab }: RealtimeFeedProps) {
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
    if (tab === 'following') {
      return (
        <EmptyState
          icon={Users}
          title="No updates from accounts you follow"
          description="Follow more people on Space to curate your personal timeline."
          actionHref="/explore"
          actionLabel="Find People to Follow"
        />
      );
    }

    return (
      <EmptyState
        icon={Sparkles}
        title="The feed is completely quiet"
        description="Be the first to share an update, thought, or photo with the community."
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-neutral-900">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
}