'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface WidgetsProps {
  postCount: number;
}

export default function Widgets({ postCount }: WidgetsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <aside className="hidden lg:flex flex-col w-80 h-screen sticky top-0 p-4 space-y-4 border-l border-gray-200 dark:border-neutral-800 bg-white dark:bg-black">
      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="relative">
        <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100/80 dark:bg-neutral-900 rounded-full text-sm outline-none border border-transparent focus:border-gray-300 dark:focus:border-neutral-700 focus:bg-white dark:focus:bg-black transition text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
      </form>

      {/* Quick Stats Panel */}
      <div className="p-4 bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Personal Vault</h3>
        <div className="flex items-center justify-between text-sm py-1 border-b border-gray-200/50 dark:border-neutral-800">
          <span className="text-gray-500 dark:text-neutral-400">Total Updates</span>
          <span className="font-bold text-gray-900 dark:text-white">{postCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1">
          <span className="text-gray-500 dark:text-neutral-400">Storage</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">Supabase Free</span>
        </div>
      </div>
    </aside>
  );
}