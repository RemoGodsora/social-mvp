'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import EditProfileModal from '@/app/EditProfileModal';
import { toggleFollow } from '@/app/actions';

interface ProfileHeaderProps {
  profile: any;
  user: any;
  isFollowing: boolean;
  followingCount: number;
  followerCount: number;
}

export default function ProfileHeader({
  profile,
  user,
  isFollowing,
  followingCount,
  followerCount,
}: ProfileHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isOwner = user && user.id === profile.id;

  return (
    <>
      <div className="p-6 border-b border-gray-200 dark:border-neutral-800 space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-extrabold text-2xl flex items-center justify-center shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              (profile.full_name || profile.username || 'U')[0]?.toUpperCase()
            )}
          </div>

          {/* Owner: Edit Profile Button */}
          {isOwner ? (
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
              Edit Profile
            </button>
          ) : user ? (
            /* Visitor: Follow / Unfollow */
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
          ) : null}
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

      {isOwner && (
        <EditProfileModal
          profile={profile}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}