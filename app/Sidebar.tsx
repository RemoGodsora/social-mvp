'use client';

import { Home, User, Bell, Bookmark, Settings, LogOut, Search } from 'lucide-react';
import { signout } from '@/app/actions';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBadge from '@/app/NotificationBadge';

interface SidebarProps {
  user: any;
  profile: any;
  unreadCount?: number;
}

export default function Sidebar({ user, profile, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const profileHref = profile?.username ? `/${profile.username}` : '#';

  const navItems = [
    { label: 'Home', icon: Home, href: '/', active: pathname === '/' },
    { label: 'Explore', icon: Search, href: '/explore', active: pathname.startsWith('/explore') },
    { label: 'Notifications', icon: Bell, href: '/notifications', active: pathname.startsWith('/notifications') },
    { label: 'Bookmarks', icon: Bookmark, href: '/bookmarks', active: pathname.startsWith('/bookmarks') },
    { label: 'Profile', icon: User, href: profileHref, active: pathname === profileHref },
    { label: 'Settings', icon: Settings, href: '/settings', active: pathname === '/settings' },
  ];

  return (
    <aside className="hidden sm:flex flex-col justify-between w-64 h-screen sticky top-0 p-4 border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black select-none">
      <div className="space-y-6">
        {/* App Logo & Theme Switcher */}
        <div className="px-3 pt-2 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            space.
          </Link>
          <ThemeToggle />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isNotification = item.label === 'Notifications';

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-full text-base font-medium transition ${
                  item.active
                    ? 'font-bold text-black dark:text-white bg-gray-100/80 dark:bg-neutral-900'
                    : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={22} />
                  <span>{item.label}</span>
                </div>

                {isNotification && (
                  <NotificationBadge />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Card / Logout */}
      {user && (
        <div className="p-2 border border-gray-100 dark:border-neutral-800 rounded-2xl bg-gray-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
          <Link href={profileHref} className="flex items-center gap-3 min-w-0 pr-2 flex-1 group">
            <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold flex items-center justify-center shrink-0">
              {(profile?.full_name || profile?.username || 'U')[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:underline">
                {profile?.full_name || 'Member'}
              </p>
              <p className="text-xs text-gray-400 dark:text-neutral-500 truncate">
                @{profile?.username || 'user'}
              </p>
            </div>
          </Link>

          <form action={signout}>
            <button
              type="submit"
              title="Log out"
              className="p-2 text-gray-400 hover:text-red-600 transition rounded-full hover:bg-white dark:hover:bg-neutral-800"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}