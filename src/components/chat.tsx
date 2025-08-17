import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Loader2, SendHorizonal } from 'lucide-react';

interface ChatUiProps {
  objectId: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function AwaitingResponseLoader() {
  return (
    <>
      <div className="loader"></div>
      <style>
        {`
          .loader {
            width: 15px;
            aspect-ratio: 2;
            --_g: no-repeat radial-gradient(circle closest-side,#000 90%,#0000);
            background: 
              var(--_g) 0%   50%,
              var(--_g) 50%  50%,
              var(--_g) 100% 50%;
            background-size: calc(100%/3) 50%;
            animation: l3 1s infinite linear;
          }
          @keyframes l3 {
            20%{background-position:0%   0%, 50%  50%,100%  50%}
            40%{background-position:0% 100%, 50%   0%,100%  50%}
            60%{background-position:0%  50%, 50% 100%,100%   0%}
            80%{background-position:0%  50%, 50%  50%,100% 100%}
          }
        `}
      </style>
    </>
  );
}

export default function ChatUi({ objectId }: ChatUiProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function sendPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
    setLoading(true);
    setPrompt('');

    let assistantMsg = '';
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    const res = await fetch(`/api/chat/${objectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.body) {
      assistantMsg = 'No response body.';
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: assistantMsg };
        return updated;
      });
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      if (value) {
        assistantMsg += decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantMsg };
          return updated;
        });
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      done = streamDone;
    }

    setLoading(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <Card className="flex h-full flex-col border-0 pb-0 shadow-none!">
      <CardContent className="flex h-full flex-col p-0">
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-2">
          {messages.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">Ask anything about your video!</div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`shadow-shadow max-w-[80%] rounded-lg border px-4 py-2 text-sm whitespace-pre-wrap ${
                msg.role === 'user' ? 'bg-main text-main-foreground ml-auto' : 'text-foreground mr-auto bg-white'
              }`}
            >
              {msg.content === '' ? <AwaitingResponseLoader /> : msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendPrompt} className="bg-background flex items-end gap-2 border-t px-4 py-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="rounded-base border-border shadow-shadow bg-secondary-background flex-1 resize-none border-2 px-3 py-2 text-sm focus-visible:outline-none"
            placeholder="Type your message..."
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (prompt.trim() && !loading) {
                  (e.target as HTMLTextAreaElement).form?.requestSubmit();
                }
              }
            }}
          />
          <Button type="submit" className="h-full cursor-pointer" disabled={loading || !prompt.trim()} size="sm">
            {loading ? <Loader2 className="animate-spin" /> : <SendHorizonal />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
