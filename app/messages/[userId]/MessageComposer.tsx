'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, Send, X, Loader2 } from 'lucide-react';
import { sendMessage } from '@/app/actions';

interface MessageComposerProps {
  recipientId: string;
}

export default function MessageComposer({ recipientId }: MessageComposerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const hasFile = Boolean(fileInputRef.current?.files?.[0]);
    if (!text.trim() && !hasFile) return;

    setIsSending(true);
    const formData = new FormData(e.currentTarget);

    try {
      await sendMessage(formData);
      setText('');
      removeImage();
      formRef.current?.reset();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-black sticky bottom-0 z-20">
      {/* Thumbnail preview before sending */}
      {preview && (
        <div className="relative mb-3 w-fit">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 shadow-md">
            <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-1.5 -right-1.5 bg-black text-white dark:bg-white dark:text-black p-1 rounded-full shadow hover:opacity-80 transition"
            title="Remove attachment"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="flex gap-2 items-center"
      >
        <input type="hidden" name="recipientId" value={recipientId} />

        {/* Media file picker */}
        <label
          className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-black dark:hover:text-white cursor-pointer transition shrink-0"
          title="Attach image or GIF"
        >
          <ImageIcon size={20} />
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <input
          type="text"
          name="content"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message or paste a link..."
          autoComplete="off"
          className="flex-1 bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-full px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white transition"
        />

        <button
            type="submit"
            suppressHydrationWarning
            disabled={isSending || (!text.trim() && !preview)}
            className="p-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
            <Send size={16} />
        </button>
      </form>
    </div>
  );
}