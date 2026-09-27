'use client';

import { useOptimistic, startTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike } from '@/app/actions';

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isLoggedIn: boolean;
}

export default function LikeButton({
  postId,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
}: LikeButtonProps) {
  const [optimisticState, setOptimisticState] = useOptimistic(
    { isLiked: initialIsLiked, count: initialLikeCount },
    (state) => ({
      isLiked: !state.isLiked,
      count: state.isLiked ? state.count - 1 : state.count + 1,
    })
  );

  if (!isLoggedIn) {
    return (
      <div className="flex items-center space-x-1.5 text-xs text-gray-400">
        <Heart size={16} />
        <span>{optimisticState.count > 0 ? optimisticState.count : ''}</span>
      </div>
    );
  }

  const handleAction = async (formData: FormData) => {
    startTransition(() => {
      setOptimisticState(null);
    });
    await toggleLike(formData);
  };

  return (
    <form action={handleAction}>
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-neutral-400 hover:text-red-500 transition group"
      >
        <Heart
          size={16}
          className={`transition-transform duration-150 active:scale-125 ${
            optimisticState.isLiked
              ? 'fill-red-500 text-red-500'
              : 'text-gray-400 group-hover:text-red-500'
          }`}
        />
        <span className={optimisticState.isLiked ? 'text-red-500 font-semibold' : ''}>
          {optimisticState.count > 0 ? optimisticState.count : ''}
        </span>
      </button>
    </form>
  );
}