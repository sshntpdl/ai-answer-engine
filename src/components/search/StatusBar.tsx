'use client';
// src/components/search/StatusBar.tsx

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  status: string;
  className?: string;
}

export function StatusBar({ status, className }: StatusBarProps) {
  if (!status) return null;

  return (
    <div className={cn('flex items-center gap-2 text-sm text-zinc-500', className)}>
      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
      <span>{status}</span>
    </div>
  );
}
