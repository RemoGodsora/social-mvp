'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface ExploreSearchInputProps {
  initialQuery?: string;
}

export default function ExploreSearchInput({ initialQuery = '' }: ExploreSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      router.push('/explore');
      return;
    }
    router.push(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
    router.push('/explore');
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search updates, people, tags..."
        className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-neutral-900 rounded-full text-sm outline-none border border-transparent focus:border-gray-300 dark:focus:border-neutral-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-black dark:hover:text-white p-0.5 rounded-full"
        >
          <X size={15} />
        </button>
      )}
    </form>
  );
}