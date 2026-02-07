'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Mail, Check } from 'lucide-react';
import { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ isOpen, onOpenChange }: ContactModalProps) {
  const [copied, setCopied] = useState(false);
  const email = 'elero.obaitan@gmail.com';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onOpenChange(false);
    }, 800);
  };

  const handleSendEmail = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold text-indigo-900 dark:text-indigo-400">
            Contact Us
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-center mx-6 text-[15px]">
            Have questions or found inaccuracies? Get in touch with our team.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center pt-6 pb-3 space-y-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-full text-indigo-600 dark:text-indigo-400 animate-in zoom-in duration-300">
            <Mail className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div
            className="text-center group cursor-pointer"
            onClick={copyToClipboard}
          >
            <p className="text-lg font-medium text-zinc-900 dark:text-indigo-400 group-hover:text-indigo-900 dark:group-hover:text-indigo-400 transition-colors">
              {email}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size={'lg'}
            className="flex-1 gap-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy Email'}
          </Button>
          <Button
            size={'lg'}
            className="flex-1 gap-2 bg-indigo-800 hover:bg-indigo-800 dark:bg-indigo-400 text-white dark:text-white font-semibold transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
            asChild
            onClick={handleSendEmail}
          >
            <a href={`mailto:${email}`}>
              <Mail className="h-4 w-4" />
              Send Email
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
