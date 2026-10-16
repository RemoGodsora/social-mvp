'use client';

import { Home, Bookmark, User, Search, Bell, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBadge from '@/app/NotificationBadge';
import { MessageSquare } from 'lucide-react';

interface MobileNavProps {
  currentUsername?: string;
  unreadCount?: number;
  userId?: string;
}

export default function MobileNav({ currentUsername, unreadCount = 0, userId }: MobileNavProps) {
  const pathname = usePathname();
  const profileHref = currentUsername ? `/${currentUsername}` : '#';

  const navItems = [
    { label: 'Home', icon: Home, href: '/', active: pathname === '/' },
    { label: 'Explore', icon: Search, href: '/explore', active: pathname.startsWith('/explore') },
    { label: 'Notifications', icon: Bell, href: '/notifications', active: pathname.startsWith('/notifications') },
    { label: 'Bookmarks', icon: Bookmark, href: '/bookmarks', active: pathname.startsWith('/bookmarks') },
    { label: 'Profile', icon: User, href: profileHref, active: pathname === profileHref },
    { label: 'Messages', icon: MessageSquare, href: '/messages', active: pathname.startsWith('/messages') },
    { label: 'Settings', icon: Settings, href: '/settings', active: pathname === '/settings' },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-t border-gray-200 dark:border-neutral-800 flex justify-around items-center py-2.5 z-20">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isNotification = item.label === 'Notifications';

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`p-2 rounded-full relative transition ${
              item.active
                ? 'text-black dark:text-white font-bold'
                : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Icon size={22} />
            {isNotification && (
              <div className="absolute top-1 right-1">
                <NotificationBadge />
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}