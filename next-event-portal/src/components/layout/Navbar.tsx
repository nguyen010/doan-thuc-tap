'use client'

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, Search, Settings, ChevronRight, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useEvents } from '@/context/EventsContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { searchQuery, setSearchQuery } = useEvents();
  const router = useRouter();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3 md:px-8 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-1 md:gap-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden h-8 w-8 text-slate-500">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="hidden lg:flex items-center gap-8 px-4">
        <Link href="/" className="text-[10px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-[0.2em] font-mono">{t('homepage')}</Link>
        <Link href="/events" className="text-[10px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-[0.2em] font-mono">{t('conferenceEvent')}</Link>
        <Link href="/calendar" className="text-[10px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-[0.2em] font-mono">{t('eventCalendar')}</Link>
        {user && (user.role === 'STUDENT' || user.role === 'EVENT_MANAGER') && (
          <div className="relative group">
            <Link href="/my-events" className="text-[10px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-[0.2em] font-mono flex items-center gap-1 group/link">
              {t('myEvent')}
              <div className="w-[1px] h-3 bg-red-600 absolute -bottom-1 left-0 scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left"></div>
            </Link>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white border border-slate-100 shadow-xl rounded-sm py-2 min-w-[200px]">
                 <Link href="/my-events" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors">
                   <ChevronRight className="h-3 w-3 text-slate-300" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">{t('myEvent')}</span>
                 </Link>
                 <Link href="/participated-events" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors border-t border-slate-50">
                   <ChevronRight className="h-3 w-3 text-slate-300" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('participationInEvent')}</span>
                 </Link>
              </div>
            </div>
          </div>
        )}
        <Link href="/personal-info" className="text-[10px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-[0.2em] font-mono">{t('personalInfo')}</Link>
      </div>

      <div className="flex items-center gap-1 md:gap-6">
        <div className="relative hidden md:block">
          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim() !== '' && window.location.pathname !== '/events') {
                router.push('/events');
              }
            }}
            className="w-48 lg:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 h-9 bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {!user ? (
            <Link href="/login" className="bg-red-600 text-white px-3 md:px-4 py-1.5 rounded-sm hover:bg-red-700 transition-colors uppercase text-[9px] md:text-[10px] font-black tracking-widest whitespace-nowrap">
              {t('login')}
            </Link>
          ) : (
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
