import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/app/Sidebar';
import Widgets from '@/app/Widgets';
import MobileNav from '@/app/MobileNav';
import ThemeToggle from '@/app/ThemeToggle';
import { signout } from '@/app/actions';
import { Moon, User, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-gray-100 flex justify-center">
      <div className="w-full max-w-6xl flex justify-between bg-white dark:bg-black border-x border-gray-200 dark:border-neutral-800 min-h-screen">
        <Sidebar user={user} profile={profile} />

        <main className="flex-1 max-w-xl min-h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black pb-20">
          <header className="p-4 border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10">
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Settings
            </h1>
          </header>

          <div className="divide-y divide-gray-100 dark:divide-neutral-900 text-sm">
            {/* Appearance Section */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon size={18} className="text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Theme</p>
                  <p className="text-xs text-gray-400">Toggle between light and dark mode</p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* Account Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Account Information</p>
                  <p className="text-xs text-gray-400">Signed in as @{profile?.username}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900 dark:text-white font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">User ID</span>
                  <span className="font-mono text-gray-400 truncate max-w-[200px]">{user.id}</span>
                </div>
              </div>
            </div>

            {/* Profile Quick Link */}
            <div className="p-4">
              <Link
                href={`/${profile?.username}`}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-800 font-semibold hover:bg-gray-50 dark:hover:bg-neutral-900 transition"
              >
                View & Edit Public Profile
              </Link>
            </div>

            {/* Sign Out Action */}
            <div className="p-4">
              <form action={signout}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold transition"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </form>
            </div>
          </div>
        </main>

        <Widgets postCount={0} />
      </div>

      <MobileNav currentUsername={profile?.username} />
    </div>
  );
}