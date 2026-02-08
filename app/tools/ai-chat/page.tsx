'use client';

import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AIAssistantMessages } from '@/components/ai-chat/AIAssistantMessages';
import { AIAssistantInput } from '@/components/ai-chat/AIAssistantInput';
import { Message } from '@/app/types';
import { buildSessionContext } from '@/lib/ai/sessionContext';

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (editingMessageId) {
      const editedContent = input.trim();
      const updatedMessages = messages.map((m) =>
        m.id === editingMessageId
          ? {
              ...m,
              content: editedContent,
              edited: true,
              editedAt: new Date(),
              timestamp: new Date(),
            }
          : m,
      );

      setMessages(updatedMessages);
      setInput('');
      setIsLoading(true);
      setEditingMessageId(null);

      try {
        const response = await fetch('/api/tax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: editedContent,
            context: buildSessionContext(updatedMessages),
          }),
        });

        const data = await response.json();

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            data.aiResponse || "I'm sorry, I couldn't process your request.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('AI Query Error:', error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            'Something went wrong while processing your request. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const question = input.trim();
    const context = buildSessionContext(messages);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          data.aiResponse || "I'm sorry, I couldn't process your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Query Error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Something went wrong while processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-[calc(100dvh-64px)] bg-zinc-50 dark:bg-zinc-950">
        <main className="grow flex flex-col">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-12 xl:px-0 pt-10">
            <div className="space-y-4 max-w-2xl">
              <p className="text-lg md:text-[22px] text-zinc-800 dark:text-zinc-400 max-w-3xl leading-relaxed font-medium">
                Our{' '}
                <span className="text-indigo-800 dark:text-indigo-400 font-bold">
                  AI Chat Assistant
                </span>{' '}
                is here to help you understand the new tax regime.{' '}
                <span className="font-bold underline decoration-indigo-500 underline-offset-4">
                  Ask anything tax-related
                </span>
                .
              </p>
            </div>
          </div>
          <AIAssistantMessages
            messages={messages}
            isLoading={isLoading}
            onEditMessage={(id) => {
              const msg = messages.find((m) => m.id === id);
              if (!msg) return;
              setInput(msg.content);
              setEditingMessageId(id);
            }}
          />
        </main>

        <div className="sticky bottom-0 z-40 bg-zinc-50/60 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200/50 dark:border-zinc-800/50">
          <AIAssistantInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onNewSession={() => {
              setMessages([]);
              setEditingMessageId(null);
              setInput('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSubmit={handleSubmit}
            editingMessageId={editingMessageId}
            onCancelEdit={() => {
              setEditingMessageId(null);
              setInput('');
            }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
