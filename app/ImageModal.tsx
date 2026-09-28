'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ src, isOpen, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-[110] text-white/80 hover:text-white p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 transition cursor-pointer"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl max-h-[92vh] flex items-center justify-center"
      >
        <img
          src={src}
          alt="Full view"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
        />
      </div>
    </div>
  );
}