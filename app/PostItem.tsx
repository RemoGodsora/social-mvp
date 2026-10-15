'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNowStrict } from 'date-fns';
import { Trash2, MessageCircle, Send, Bookmark } from 'lucide-react';
import { deletePost, createComment, toggleBookmark } from '@/app/actions';
import { Coffee } from 'lucide-react';
import LikeButton from '@/app/LikeButton';
import ImageModal from '@/app/ImageModal';
import TipModal from '@/app/TipModal';

interface PostItemProps {
  post: any;
  currentUserId?: string;
  isBookmarked?: boolean;
}

export default function PostItem({ post, currentUserId, isBookmarked = false }: PostItemProps) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(false);

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
    <>
      <article className="p-4 space-y-3 transition-all duration-200 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40 hover:border-l-2 hover:border-l-black dark:hover:border-l-white border-l-2 border-l-transparent">
        {/* Author Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              href={post.profiles?.username ? `/${post.profiles.username}` : '#'}
              className="flex items-center space-x-2 hover:opacity-80 transition group"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold flex items-center justify-center text-xs">
                {(post.profiles?.full_name || post.profiles?.username || 'U')[0]?.toUpperCase()}
              </div>
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

        {/* Post Text Content - Navigates to Single Post */}
        {post.content && (
          <p
            onClick={() => router.push(`/post/${post.id}`)}
            className="text-gray-800 dark:text-neutral-200 whitespace-pre-line text-sm leading-relaxed cursor-pointer"
          >
            {post.content}
          </p>
        )}

        {/* Media Attachment - Click to View Fullscreen Lightbox */}
        {post.image_url && (
          <div
            onClick={() => setIsImageOpen(true)}
            className="rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 max-h-96 cursor-zoom-in group/img relative"
          >
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full h-auto object-cover max-h-96 group-hover/img:opacity-95 transition"
            />
          </div>
        )}

        {/* UPI Chai Tip Button */}
        {post.profiles?.upi_id && currentUserId !== post.user_id && (
          <button
            type="button"
            onClick={() => setIsTipOpen(true)}
            className="p-1.5 text-gray-400 hover:text-amber-500 transition rounded-full flex items-center gap-1 text-xs"
            title="Gift a Chai"
          >
            <Coffee size={16} />
            <span className="hidden sm:inline">Tip</span>
          </button>
        )}

        {/* Tip Modal */}
        {post.profiles?.upi_id && (
          <TipModal
            authorName={post.profiles.full_name || post.profiles.username}
            upiId={post.profiles.upi_id}
            isOpen={isTipOpen}
            onClose={() => setIsTipOpen(false)}
          />
        )}

        {/* Action Row */}
        <div className="pt-1 flex items-center justify-between text-gray-500 dark:text-neutral-400">
          <div className="flex items-center gap-6">
            <LikeButton
              postId={post.id}
              initialLikeCount={likeCount}
              initialIsLiked={Boolean(isLiked)}
              isLoggedIn={Boolean(currentUserId)}
            />

            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-1.5 text-xs transition ${
                showComments
                  ? 'text-sky-500 font-semibold'
                  : 'hover:text-sky-500'
              }`}
            >
              <MessageCircle size={16} />
              <span>{commentCount > 0 ? commentCount : ''}</span>
            </button>
          </div>

          {currentUserId && (
            <form action={toggleBookmark}>
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                className="hover:text-amber-500 transition p-1"
                title="Save post"
              >
                <Bookmark
                  size={16}
                  className={isBookmarked ? 'fill-amber-500 text-amber-500' : ''}
                />
              </button>
            </form>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800/80 space-y-3">
            {currentUserId && (
              <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post a reply..."
                  maxLength={280}
                  className="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-full px-3.5 py-1.5 text-xs outline-none text-gray-900 dark:text-white"
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

            <div className="space-y-2 pt-1">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-neutral-900/60 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400">
                      <Link
                        href={`/${comment.profiles?.username}`}
                        className="font-semibold text-gray-900 dark:text-white hover:underline"
                      >
                        {comment.profiles?.full_name || comment.profiles?.username || 'User'}
                      </Link>
                      <span>·</span>
                      <span suppressHydrationWarning className="text-[11px]">
                        {formatDistanceToNowStrict(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-neutral-200">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 dark:text-neutral-500 py-1 text-center">
                  No replies yet.
                </p>
              )}
            </div>
          </div>
        )}
      </article>

      {/* Fullscreen Lightbox Modal */}
      {post.image_url && (
        <ImageModal
          src={post.image_url}
          isOpen={isImageOpen}
          onClose={() => setIsImageOpen(false)}
        />
      )}
    </>
  );
}