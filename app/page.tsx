'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { WelcomeScreen } from '@/components/home/WelcomeScreen';

export default function Home() {
  return (
    <TooltipProvider>
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)] md:min-h-[calc(70vh-100px)] lg:min-h-[calc(70vh-100px)] xl:min-h-[calc(95vh-100px)] bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 px-6 md:px-12 py-16 md:py-12">
        <WelcomeScreen />
      </div>
    </TooltipProvider>
  );
}
