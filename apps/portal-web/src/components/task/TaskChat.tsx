'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import { useLocale } from '@/lib/locale-context';

interface ChatMessage {
  id: string;
  taskId: string;
  userId: string;
  message: string;
  type: string;
  createdAt: string;
  user: { id: string; fullName: string };
}

interface TaskChatProps {
  taskId: string;
}

export function TaskChat({ taskId }: TaskChatProps) {
  const { user } = useAuth();
  const { locale } = useLocale();
  const { emit, on, connected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const vi = locale === 'vi';

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:4006/api/v1/tasks/${taskId}/comments?limit=100`);
      const data = await res.json();
      setMessages(data.data || []);
    } catch {}
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    fetchMessages();
    emit('task:join', { taskId });
    return () => { emit('task:leave', { taskId }); };
  }, [taskId, fetchMessages, emit]);

  useEffect(() => {
    const unsub1 = on('chat:message', (msg: ChatMessage) => {
      if (msg.taskId === taskId) setMessages((prev) => [...prev, msg]);
    });
    const unsub2 = on('chat:typing', (data: { userId: string; userName: string }) => {
      if (data.userId !== user?.id) {
        setTypingUser(data.userName);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTypingUser(null), 3000);
      }
    });
    return () => { unsub1(); unsub2(); };
  }, [on, taskId, user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    setSending(true);
    try {
      await fetch(`http://localhost:4006/api/v1/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, message: input.trim() }),
      });
      setInput('');
    } catch {}
    setSending(false);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (user) emit('chat:typing', { taskId, userId: user.id, userName: user.fullName });
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{vi ? 'Trao đổi' : 'Discussion'}</span>
        <span className="text-xs text-muted-foreground">({messages.length})</span>
        {connected && <span className="ml-auto h-2 w-2 rounded-full bg-green-500" title="Connected" />}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        {loading && <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">{vi ? 'Chưa có tin nhắn' : 'No messages yet'}</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.userId === user?.id || msg.user?.id === user?.id;
          const isSystem = msg.type === 'status_change';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{msg.message}</span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                {!isMe && <p className="text-[10px] text-muted-foreground mb-0.5 px-1">{msg.user?.fullName}</p>}
                <div className={`rounded-2xl px-3 py-2 text-sm ${
                  isMe ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'
                }`}>
                  {msg.message}
                </div>
                <p className={`text-[10px] text-muted-foreground mt-0.5 px-1 ${isMe ? 'text-right' : ''}`}>
                  {new Date(msg.createdAt).toLocaleTimeString(vi ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {typingUser && (
        <div className="px-4 py-1 text-[11px] text-muted-foreground animate-pulse">
          {typingUser} {vi ? 'đang gõ...' : 'is typing...'}
        </div>
      )}

      <div className="border-t p-3 flex gap-2">
        <Input
          placeholder={vi ? 'Nhập tin nhắn...' : 'Type a message...'}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={sending}
          className="text-sm"
        />
        <Button size="sm" onClick={handleSend} disabled={!input.trim() || sending} className="shrink-0 px-3">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
