// ============================================
// Theme Toggle Component
// 다크모드/라이트모드 전환 스위치
// ============================================

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-muted">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <div className="w-10 h-5 bg-muted-foreground/20 rounded-full" />
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    // 강제로 HTML class 업데이트
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-muted/50 border">
      <Sun className={cn(
        "h-4 w-4 transition-colors",
        !isDark ? "text-orange-500" : "text-muted-foreground"
      )} />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-orange-400"
      />
      <Moon className={cn(
        "h-4 w-4 transition-colors",
        isDark ? "text-yellow-400" : "text-muted-foreground"
      )} />
    </div>
  );
}

// 간단한 토글 버튼
export function ThemeToggleSimple() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  return (
    <Switch
      checked={isDark}
      onCheckedChange={handleToggle}
      className="data-[state=checked]:bg-slate-700"
    />
  );
}
