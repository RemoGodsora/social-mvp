'use client';

import { useState } from 'react';
import { X, Coffee, ExternalLink, QrCode } from 'lucide-react';

interface TipModalProps {
  authorName: string;
  upiId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TipModal({ authorName, upiId, isOpen, onClose }: TipModalProps) {
  const [amount, setAmount] = useState('20');
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    authorName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent('Tip on space')}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiUrl
  )}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Coffee size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Gift a Chai</h3>
              <p className="text-xs text-gray-400 dark:text-neutral-500">To {authorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount Selection */}
        <div className="grid grid-cols-3 gap-2">
          {['20', '50', '100'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={`py-2 text-sm font-semibold rounded-xl border transition ${
                amount === preset
                  ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                  : 'border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900'
              }`}
            >
              ₹{preset}
            </button>
          ))}
        </div>

        {/* QR Code view for desktop */}
        {showQR ? (
          <div className="flex flex-col items-center py-2 space-y-2">
            <img
              src={qrImageUrl}
              alt="UPI QR Code"
              className="w-44 h-44 rounded-xl border border-gray-100 dark:border-neutral-800 p-2 bg-white"
            />
            <p className="text-xs text-gray-400 text-center">
              Scan with GPay, PhonePe, or Paytm
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 text-xs space-y-1">
            <div className="flex justify-between text-gray-500 dark:text-neutral-400">
              <span>Recipient UPI:</span>
              <span className="font-mono text-gray-900 dark:text-gray-200">{upiId}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-neutral-400">
              <span>Amount:</span>
              <span className="font-bold text-gray-900 dark:text-white">₹{amount}</span>
            </div>
          </div>
        )}

        {/* Payment Buttons */}
        <div className="space-y-2 pt-1">
          {/* Direct deep-link on mobile */}
          <a
            href={upiUrl}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
          >
            <span>Pay ₹{amount} via UPI App</span>
            <ExternalLink size={15} />
          </a>

          {/* Toggle QR code */}
          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition"
          >
            <QrCode size={14} />
            <span>{showQR ? 'Hide QR Code' : 'Show UPI QR Code (for Desktop)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}