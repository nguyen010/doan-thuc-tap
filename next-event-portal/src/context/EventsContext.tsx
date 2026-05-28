'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Event, EventStatus } from '@/types';
import { eventService } from '@/services/event.service';

interface EventsContextType {
  events: Event[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
}

const STORAGE_KEY = 'va_events';

const STATUS_MAP: Record<string, EventStatus> = {
  DRAFT: EventStatus.UPCOMING,
  UPCOMING: EventStatus.UPCOMING,
  OPEN: EventStatus.OPEN,
  ONGOING: EventStatus.OPEN,
  CLOSED: EventStatus.CLOSED,
  COMPLETED: EventStatus.COMPLETED,
  CANCELLED: EventStatus.CLOSED,
};

function toUiEvent(e: Record<string, unknown>): Event {
  const startDate = e.startDate ? new Date(e.startDate as string) : new Date();
  const endDate = e.endDate ? new Date(e.endDate as string) : new Date();
  return {
    id: String(e.id),
    title: (e.title as string) ?? '',
    description: (e.description as string) ?? '',
    location: (e.location as string) ?? '',
    date: startDate.toISOString().split('T')[0],
    startTime: startDate.toTimeString().slice(0, 5),
    endTime: endDate.toTimeString().slice(0, 5),
    capacity: (e.maxParticipants as number) ?? 0,
    status: STATUS_MAP[e.status as string] ?? EventStatus.OPEN,
    organizerId: String(e.organizerId || e.createdBy || 'admin'),
    category: (e.eventCategory as string) ?? (e.category as string) ?? '',
    image: (e.imageUrl as string) || (e.bannerUrl as string) || (e.banner as string) || undefined,
    displayCategory: (e.displayCategory as 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL') ?? undefined,
    createdAt: e.createdAt ? new Date(e.createdAt as string).getTime() : Date.now(),
  };
}

function toApiPayload(eventData: Omit<Event, 'id' | 'createdAt'>) {
  const str = (val: string | { EN: string; VI: string } | undefined, lang: 'EN' | 'VI' = 'VI') =>
    typeof val === 'string' ? val : (val?.[lang] || val?.EN || '');

  const startDate = `${eventData.date}T${eventData.startTime || '00:00'}:00.000Z`;
  const endDate = `${eventData.date}T${eventData.endTime || '23:59'}:00.000Z`;

  return {
    title: str(eventData.title),
    description: str(eventData.description),
    location: str(eventData.location),
    startDate,
    endDate,
    maxParticipants: eventData.capacity,
    imageUrl: eventData.image,
    displayCategory: eventData.displayCategory,
    eventCategory: eventData.category,
  };
}

const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: { EN: 'WORKSHOP "SEXUAL HEALTH: THINGS NOT EVERYONE SHARES WITH YOU"', VI: 'HỘI THẢO "SỨC KHỎE TÌNH DỤC: NHỮNG ĐIỀU KHÔNG PHẢI AI CŨNG CHIA SẺ"' },
    description: { EN: 'Master the arts of digital marketing with industry experts.', VI: 'Làm chủ nghệ thuật tiếp thị kỹ thuật số cùng các chuyên gia trong ngành.' },
    location: { EN: 'Hall A01.01', VI: 'Hội trường A01.01' },
    date: '2026-05-20', startTime: '14:00', endTime: '16:00', capacity: 200,
    status: EventStatus.OPEN, organizerId: 'admin', category: 'MEDICAL TECHNOLOGY CENTER', displayCategory: 'FEATURED', createdAt: Date.now(),
  },
  {
    id: '2',
    title: { EN: 'WORKSHOP "BUILDING A CODING ASSISTANT FROM CHAT TO SKILL"', VI: 'HỘI THẢO "XÂY DỰNG TRỢ LÝ LẬP TRÌNH TỪ CHAT ĐẾN KỸ NĂNG"' },
    description: { EN: 'Building AI agents using modern tools.', VI: 'Xây dựng đại lý AI bằng các công cụ hiện đại.' },
    location: { EN: 'Building J, CS3-J.03.05', VI: 'Tòa nhà J, CS3-J.03.05' },
    date: '2026-05-16', startTime: '07:30', endTime: '11:00', capacity: 100,
    status: EventStatus.OPEN, organizerId: 'admin', category: 'VA TECH', displayCategory: 'FEATURED', createdAt: Date.now(),
  },
  {
    id: '3',
    title: { EN: '2026 KOREAN LITERARY WORK STAGE PERFORMANCE CONTEST', VI: 'CUỘC THI TRÌNH DIỄN SÂN KHẤU TÁC PHẨM VĂN HỌC HÀN QUỐC 2026' },
    description: { EN: 'Performance contest featuring Korean literary works.', VI: 'Cuộc thi biểu diễn các tác phẩm văn học Hàn Quốc.' },
    location: { EN: 'Online', VI: 'Trực tuyến' },
    date: '2026-05-25', startTime: '09:00', endTime: '12:00', capacity: 500,
    status: EventStatus.OPEN, organizerId: 'admin', category: 'KOREAN CENTER', displayCategory: 'FEATURED', createdAt: Date.now(),
  },
  {
    id: '4',
    title: { EN: 'IMPACT STARTUP CHALLENGE 2026', VI: 'THỬ THÁCH KHỞI NGHIỆP TÁC ĐỘNG 2026' },
    description: { EN: 'Pitching competition for innovative startups.', VI: 'Cuộc thi thuyết trình dành cho các startup đổi mới sáng tạo.' },
    location: { EN: 'Building J, CS3-Updating', VI: 'Tòa nhà J, CS3-Đang cập nhật' },
    date: '2026-05-25', startTime: '09:00', endTime: '17:00', capacity: 300,
    status: EventStatus.OPEN, organizerId: 'admin', category: 'INNOVATION HUB', displayCategory: 'FEATURED', createdAt: Date.now(),
  },
];

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await eventService.getAll();
        const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
        if (list.length > 0) {
          const uiEvents = list.map(toUiEvent);
          setEvents(uiEvents);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(uiEvents));
          return;
        }
      } catch {
        // API unavailable — fall through to localStorage
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setEvents(JSON.parse(saved));
          return;
        } catch {
          // corrupted cache — use defaults
        }
      }
      setEvents(INITIAL_EVENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
    }

    loadEvents().finally(() => setIsLoading(false));
  }, []);

  const persistLocal = useCallback((updated: Event[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      const result = await eventService.create(toApiPayload(eventData));
      const newEvent = toUiEvent(result);
      setEvents(prev => {
        const updated = [...prev, newEvent];
        persistLocal(updated);
        return updated;
      });
    } catch {
      const newEvent: Event = { ...eventData, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
      setEvents(prev => {
        const updated = [...prev, newEvent];
        persistLocal(updated);
        return updated;
      });
    }
  }, [persistLocal]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await eventService.delete(id);
    } catch {
      // proceed with local deletion even if API fails
    }
    setEvents(prev => {
      const updated = prev.filter(e => e.id !== id);
      persistLocal(updated);
      return updated;
    });
  }, [persistLocal]);

  const updateEvent = useCallback(async (id: string, eventData: Partial<Event>) => {
    try {
      const existing = events.find(e => e.id === id);
      const merged = { ...existing, ...eventData } as Omit<Event, 'id' | 'createdAt'>;
      await eventService.update(id, toApiPayload(merged));
    } catch {
      // proceed with local update even if API fails
    }
    setEvents(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...eventData } : e);
      persistLocal(updated);
      return updated;
    });
  }, [persistLocal, events]);

  return (
    <EventsContext.Provider value={{ events, isLoading, searchQuery, setSearchQuery, addEvent, deleteEvent, updateEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
