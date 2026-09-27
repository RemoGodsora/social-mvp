'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { Trash2, MessageCircle, Send, Bookmark } from 'lucide-react';
import { deletePost, createComment, deleteComment, toggleBookmark } from '@/app/actions';
import LikeButton from '@/app/LikeButton';

interface PostItemProps {
  post: any;
  currentUserId?: string;
  isBookmarked?: boolean;
}

export default function PostItem({ post, currentUserId, isBookmarked = false }: PostItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const timeAgo = formatDistanceToNowStrict(new Date(post.created_at), {
    addSuffix: true,
  });

  const likeCount = post.likes ? post.likes.length : 0;
  const isLiked = post.likes?.some((like: any) => like.user_id === currentUserId);
  const commentCount = post.comments ? post.comments.length : 0;

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const formData = new FormData();
    formData.append('postId', post.id);
    formData.append('content', commentText);

    setCommentText('');
    await createComment(formData);
  };

  return (
    <article className="p-4 space-y-3 hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition">
      {/* Post Author Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link
            href={post.profiles?.username ? `/${post.profiles.username}` : '#'}
            className="flex items-center space-x-2 hover:opacity-80 transition group"
          >
            <span className="font-semibold text-gray-900 dark:text-white text-sm group-hover:underline">
              {post.profiles?.full_name || 'Member'}
            </span>
            <span className="text-xs text-gray-400 dark:text-neutral-500">
              @{post.profiles?.username || 'user'}
            </span>
          </Link>
          <span className="text-gray-300 dark:text-neutral-700">·</span>
          <span suppressHydrationWarning className="text-xs text-gray-400 dark:text-neutral-500">
            {timeAgo}
          </span>
        </div>

        {currentUserId === post.user_id && (
          <form action={deletePost}>
            <input type="hidden" name="postId" value={post.id} />
            <button
              type="submit"
              className="text-gray-400 hover:text-red-500 p-1 transition"
              title="Delete post"
            >
              <Trash2 size={16} />
            </button>
          </form>
        )}
      </div>

      {/* Post Body Content */}
      {post.content && (
        <p className="text-gray-800 dark:text-neutral-200 whitespace-pre-line text-sm leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Media Attachment */}
      {post.image_url && (
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 max-h-96">
          <img
            src={post.image_url}
            alt="Attachment"
            className="w-full h-auto object-cover max-h-96"
          />
        </div>
      )}

      {/* Action Row: Likes, Comments, and Bookmark */}
      <div className="pt-1 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Like Button */}
          <LikeButton
            postId={post.id}
            initialLikeCount={likeCount}
            initialIsLiked={Boolean(isLiked)}
            isLoggedIn={Boolean(currentUserId)}
          />

          {/* Comment Toggle Button */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center space-x-1.5 text-xs transition ${
              showComments
                ? 'text-sky-500 font-semibold'
                : 'text-gray-500 dark:text-neutral-400 hover:text-sky-500'
            }`}
          >
            <MessageCircle size={16} />
            <span>{commentCount > 0 ? commentCount : ''}</span>
          </button>
        </div>

        {/* Bookmark Action */}
        {currentUserId && (
          <form action={toggleBookmark}>
            <input type="hidden" name="postId" value={post.id} />
            <button
              type="submit"
              className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white transition rounded-full"
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Post'}
            >
              <Bookmark
                size={16}
                className={isBookmarked ? 'fill-black dark:fill-white text-black dark:text-white' : ''}
              />
            </button>
          </form>
        )}
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800/80 space-y-3">
          {/* Comment Composer */}
          {currentUserId && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post a reply..."
                maxLength={280}
                className="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-full px-3.5 py-1.5 text-xs outline-none focus:border-gray-400 dark:focus:border-neutral-600 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full disabled:opacity-40 transition"
              >
                <Send size={13} />
              </button>
            </form>
          )}

          {/* Comment List */}
          <div className="space-y-2 pt-1">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment: any) => {
                const commentTime = formatDistanceToNowStrict(new Date(comment.created_at), {
                  addSuffix: true,
                });
                return (
                  <div
                    key={comment.id}
                    className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-neutral-900/60 text-xs space-y-1 group/comment"
                  >
                    <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/${comment.profiles?.username}`}
                          className="font-semibold text-gray-900 dark:text-white hover:underline"
                        >
                          {comment.profiles?.full_name || comment.profiles?.username || 'User'}
                        </Link>
                        <span>·</span>
                        <span suppressHydrationWarning className="text-[11px]">
                          {commentTime}
                        </span>
                      </div>

                      {currentUserId === comment.user_id && (
                        <form action={deleteComment}>
                          <input type="hidden" name="commentId" value={comment.id} />
                          <button
                            type="submit"
                            title="Delete comment"
                            className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover/comment:opacity-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </form>
                      )}
                    </div>
                    <p className="text-gray-800 dark:text-neutral-200">{comment.content}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 dark:text-neutral-500 py-1 text-center">
                No replies yet. Be the first!
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}