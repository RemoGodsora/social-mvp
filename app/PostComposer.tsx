'use client';

import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { createPost } from '@/app/actions';

export default function PostComposer() {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const MAX_CHARS = 280;
  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit = (content.trim().length > 0 || preview !== null) && !isOverLimit && !isSubmitting;

  // Auto-resize textarea height as the user types
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(72, textareaRef.current.scrollHeight)}px`;
    }
  };

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
    if (!canSubmit) return;
    try {
      setIsSubmitting(true);
      await createPost(formData);
      setContent('');
      setPreview(null);
      formRef.current?.reset();
      if (textareaRef.current) {
        textareaRef.current.style.height = '72px';
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Color dynamics for character countdown
  const getCounterColor = () => {
    if (charsLeft < 0) return 'text-red-500 font-bold';
    if (charsLeft <= 20) return 'text-amber-500 font-semibold';
    if (charsLeft <= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-400 dark:text-neutral-500';
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="p-4 border-b border-gray-200 dark:border-neutral-800 space-y-3 bg-white dark:bg-black transition-colors"
    >
      <div className="relative">
        <textarea
          ref={textareaRef}
          name="content"
          value={content}
          onChange={handleContentChange}
          placeholder="What's on your mind?"
          rows={2}
          className="w-full resize-none overflow-hidden border border-gray-200 dark:border-neutral-800 bg-transparent rounded-xl p-3 text-sm sm:text-base outline-none focus:border-neutral-400 dark:focus:border-neutral-600 text-gray-900 dark:text-neutral-100 placeholder-gray-400 transition min-h-[72px]"
        />
      </div>

      {/* Uploaded Image Preview */}
      {preview && (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 w-fit max-w-full">
          <img
            src={preview}
            alt="Upload preview"
            className="max-h-64 rounded-xl object-contain bg-gray-50 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition cursor-pointer"
            title="Remove image"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Composer Action Toolbar */}
      <div className="flex justify-between items-center pt-1">
        <label className="cursor-pointer text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition flex items-center gap-1.5 text-xs sm:text-sm px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900">
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

        <div className="flex items-center gap-3">
          {/* Dynamic Character Countdown */}
          {content.length > 0 && (
            <span className={`text-xs transition-colors duration-150 ${getCounterColor()}`}>
              {charsLeft}
            </span>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full font-semibold text-xs sm:text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}