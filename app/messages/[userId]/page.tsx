import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Sidebar from '@/app/Sidebar';
import Widgets from '@/app/Widgets';
import MobileNav from '@/app/MobileNav';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MessageComposer from './MessageComposer';

interface ChatRoomProps {
  params: Promise<{ userId: string }>;
}

export default async function ChatRoomPage({ params }: ChatRoomProps) {
  const { userId: recipientId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');
  if (recipientId === user.id) redirect('/messages');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: recipient } = await supabase.from('profiles').select('*').eq('id', recipientId).single();

  if (!recipient) notFound();

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  const isDirectImage = (text: string) => {
    return /^https?:\/\/.*\.(gif|jpe?g|png|webp|bmp)(\?.*)?$/i.test(text?.trim() || '');
  };

  const getTenorGifId = (text: string) => {
    const match = (text || '').trim().match(/tenor\.com\/view\/.*-(\d+)$/i);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-gray-100 flex justify-center">
      <div className="w-full max-w-6xl flex bg-white dark:bg-black border-x border-gray-200 dark:border-neutral-800 min-h-screen">
        <Sidebar user={user} profile={profile} />

        <main className="flex-1 min-w-0 min-h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black flex flex-col justify-between">
          {/* Header */}
          <header className="p-4 border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10 flex items-center gap-3">
            <Link
              href="/messages"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft size={18} />
            </Link>
            <Link href={`/${recipient.username}`} className="flex items-center gap-3 hover:opacity-85 transition">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold overflow-hidden text-sm shrink-0">
                {recipient.avatar_url ? (
                  <img src={recipient.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{(recipient.full_name || recipient.username)[0].toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">
                  {recipient.full_name || recipient.username}
                </h1>
                <p className="text-xs text-gray-400 truncate">@{recipient.username}</p>
              </div>
            </Link>
          </header>

          {/* Messages Stream */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto flex flex-col">
            {messages && messages.length > 0 ? (
              messages.map((msg: any) => {
                const isMe = msg.sender_id === user.id;
                const directImg = msg.content ? isDirectImage(msg.content) : false;
                const tenorId = msg.content ? getTenorGifId(msg.content) : null;

                // Skip rendering empty bubbles if there's no media and no text
                if (!msg.content && !msg.image_url && !directImg && !tenorId) {
                  return null;
                }

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {/* Standalone Tenor GIF */}
                    {tenorId ? (
                      <div className="w-64 max-w-[80vw] h-52 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
                        <iframe
                          src={`https://tenor.com/embed/${tenorId}`}
                          className="w-full h-full border-none"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      /* Standard Message Bubble */
                      <div
                        className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl text-sm break-words space-y-2 ${
                          isMe
                            ? 'bg-black text-white dark:bg-white dark:text-black rounded-br-sm'
                            : 'bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white rounded-bl-sm'
                        }`}
                      >
                        {/* Uploaded File Image / GIF */}
                        {msg.image_url && (
                          <div className="rounded-xl overflow-hidden max-h-80 border border-black/10 dark:border-white/10">
                            <img
                              src={msg.image_url}
                              alt="Attachment"
                              className="w-full h-auto object-cover max-h-80"
                            />
                          </div>
                        )}

                        {/* Direct Image Link */}
                        {directImg && (
                          <div className="rounded-xl overflow-hidden max-h-80 border border-black/10 dark:border-white/10">
                            <img
                              src={msg.content}
                              alt="GIF"
                              className="w-full h-auto object-cover max-h-80"
                            />
                          </div>
                        )}

                        {/* Text Content */}
                        {msg.content && !directImg && (
                          <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
                  Say hello to {recipient.full_name || recipient.username}!
                </p>
                <p className="text-xs text-gray-400">Send a text, photo, or GIF.</p>
              </div>
            )}
          </div>

          {/* Interactive Composer */}
          <MessageComposer recipientId={recipientId} />
        </main>

        <div className="hidden lg:block">
          <Widgets postCount={messages?.length || 0} />
        </div>
      </div>

      <MobileNav currentUsername={profile?.username} userId={user?.id} />
    </div>
  );
}