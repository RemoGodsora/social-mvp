'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { createPost } from '@/app/actions';

export default function PostComposer() {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (formData: FormData) => {
    await createPost(formData);
    setPreview(null);
    formRef.current?.reset();
  };

  return (
    <form ref={formRef} action={handleSubmit} className="p-4 border-b border-gray-200 dark:border-neutral-800 space-y-3 bg-white dark:bg-black">
      <textarea
        name="content"
        placeholder="What's on your mind?"
        maxLength={280}
        className="w-full resize-none border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 rounded-lg p-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-gray-100 placeholder-gray-400"
        rows={3}
      />

      {/* Image Preview Box */}
      {preview && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 w-fit max-w-full">
          <img
            src={preview}
            alt="Upload preview"
            className="max-h-60 rounded-lg object-contain bg-gray-50 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full transition"
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center pt-1">
        <label className="cursor-pointer text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition flex items-center gap-1.5 text-sm p-1.5 rounded hover:bg-gray-100 dark:hover:bg-neutral-850">
          <ImageIcon size={18} />
          <span>Attach Image</span>
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        <button
          type="submit"
          className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
        >
          Post
        </button>
      </div>
    </form>
  );
}