import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/app/Sidebar';
import Widgets from '@/app/Widgets';
import MobileNav from '@/app/MobileNav';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default async function MessagesInboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-10 text-center text-gray-500">Please log in to view messages.</div>;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      sender_id,
      recipient_id,
      sender:profiles!messages_sender_id_fkey(username, full_name, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(username, full_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  const conversationMap = new Map();
  messages?.forEach((msg: any) => {
    const partner = msg.sender_id === user.id ? msg.recipient : msg.sender;
    const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;

    if (partner && !conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partnerId,
        partner,
        lastMessage: msg.content,
      });
    }
  });

  const conversations = Array.from(conversationMap.values());

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-gray-100 flex justify-center">
      {/* Changed: Removed 'justify-between' so items stay flush together */}
      <div className="w-full max-w-6xl flex bg-white dark:bg-black border-x border-gray-200 dark:border-neutral-800 min-h-screen">
        <Sidebar user={user} profile={profile} />

        <main className="flex-1 max-w-2xl min-h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black pb-20">
          <header className="p-4 border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10">
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Messages</h1>
            <p className="text-xs text-gray-500 dark:text-neutral-400">Direct conversations</p>
          </header>

          {conversations.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Mail className="mx-auto text-gray-400" size={32} />
              <p className="text-sm font-semibold text-gray-700 dark:text-neutral-300">No messages yet</p>
              <p className="text-xs text-gray-400">Visit any user profile to start a conversation.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-neutral-900">
              {conversations.map((convo: any) => (
                <Link
                  key={convo.partnerId}
                  href={`/messages/${convo.partnerId}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-neutral-900/40 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center font-bold overflow-hidden shrink-0">
                    {convo.partner.avatar_url ? (
                      <img src={convo.partner.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(convo.partner.full_name || convo.partner.username)[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white truncate block">
                      {convo.partner.full_name || convo.partner.username}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">{convo.lastMessage}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        {/* Optional Right Panel: matches Home & Explore layout */}
        <Widgets postCount={conversations.length} />
      </div>
      <MobileNav currentUsername={profile?.username} userId={user?.id} />
    </div>
  );
}