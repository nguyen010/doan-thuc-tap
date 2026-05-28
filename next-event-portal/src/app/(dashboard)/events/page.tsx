'use client'

import { useRouter } from 'next/navigation';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, FileEdit, Trash2 } from 'lucide-react';
import { Event, EventStatus, UserRole } from '@/types';
import { uploadService } from '@/services/upload.service';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventsContext';
import { motion } from 'motion/react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function Events() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { t, resolve, language } = useLanguage();
  const { user } = useAuth();
  const { events, addEvent, deleteEvent, updateEvent, searchQuery } = useEvents();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    title_en: '',
    title_vi: '',
    description_en: '',
    description_vi: '',
    date: '',
    closingDate: '',
    time: '',
    location_en: '',
    location_vi: '',
    capacity: 200,
    category: '',
    displayCategory: 'FEATURED' as 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL'
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditClick = (event: Event) => {
    setEditingId(event.id);

    const getVal = (val: string | { EN: string; VI: string }, lang: 'EN' | 'VI') => {
      if (typeof val === 'string') return val;
      return val?.[lang] || '';
    };

    setFormData({
      title_en: getVal(event.title, 'EN'),
      title_vi: getVal(event.title, 'VI'),
      description_en: getVal(event.description, 'EN'),
      description_vi: getVal(event.description, 'VI'),
      date: event.date,
      closingDate: event.closingDate || '',
      time: event.startTime,
      location_en: getVal(event.location, 'EN'),
      location_vi: getVal(event.location, 'VI'),
      capacity: event.capacity,
      category: event.category,
      displayCategory: (event.displayCategory ?? 'FEATURED') as 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL'
    });
    setSelectedImage(event.image || null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = () => {
    if (editingId) {
      updateEvent(editingId, {
        title: { EN: formData.title_en, VI: formData.title_vi },
        description: { EN: formData.description_en, VI: formData.description_vi },
        date: formData.date,
        closingDate: formData.closingDate,
        startTime: formData.time,
        location: { EN: formData.location_en, VI: formData.location_vi },
        capacity: Number(formData.capacity),
        category: formData.category,
        displayCategory: formData.displayCategory,
        image: selectedImage || undefined
      });
    } else {
      addEvent({
        title: { EN: formData.title_en, VI: formData.title_vi },
        description: { EN: formData.description_en, VI: formData.description_vi },
        date: formData.date,
        closingDate: formData.closingDate,
        startTime: formData.time,
        endTime: '',
        location: { EN: formData.location_en, VI: formData.location_vi },
        capacity: Number(formData.capacity),
        status: EventStatus.OPEN,
        organizerId: user?.uid || 'anonymous',
        category: formData.category,
        displayCategory: formData.displayCategory,
        image: selectedImage || undefined
      });
    }
    
    setIsCreateOpen(false);
    setEditingId(null);
    setSelectedImage(null);
    setFormData({
      title_en: '',
      title_vi: '',
      description_en: '',
      description_vi: '',
      date: '',
      closingDate: '',
      time: '',
      location_en: '',
      location_vi: '',
      capacity: 200,
      category: '',
      displayCategory: 'FEATURED'
    });
  };

  const canCreate = user?.role === UserRole.ADMIN;

  const filteredEvents = events.filter(e => 
    resolve(e.title).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Support Header - Only for students */}
      {user?.role === UserRole.STUDENT && (
        <div className="bg-white border-b border-slate-100 -mx-4 md:-mx-8 -mt-4 md:-mt-8 py-2 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest gap-2">
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-center md:text-left">
            <span>Trung tâm Hỗ trợ Sinh viên</span>
            <span>Phone: 028 7109 9218 (Ext: 3310/3311)</span>
          </div>
          <div className="flex gap-4">
            <span className="text-red-600 bg-red-50 px-3 py-1 rounded lowercase">{user?.displayName}</span>
          </div>
        </div>
      )}

      <div className="text-center pt-4 md:pt-8 space-y-4 md:space-y-6">
        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">
          <span className="text-red-600">E</span>
          <span className="text-slate-900">vents Portal</span>
        </h2>
        
        {canCreate && (
          <div className="flex justify-center">
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) {
                setEditingId(null);
                  setFormData({
                    title_en: '',
                    title_vi: '',
                    description_en: '',
                    description_vi: '',
                    date: '',
                    closingDate: '',
                    time: '',
                    location_en: '',
                    location_vi: '',
                    capacity: 200,
                    category: '',
                    displayCategory: 'FEATURED'
                  });
                setSelectedImage(null);
              }
            }}>
              <DialogTrigger 
                render={
                  <Button className="bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-xs h-11 px-8 rounded-lg shadow-lg shadow-red-900/20">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('createEvent')}
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[600px] bg-white border-none shadow-2xl rounded-2xl max-h-[95vh] overflow-y-auto p-0 flex flex-col">
                <DialogHeader className="p-6 pb-2 border-b border-slate-50 sticky top-0 bg-white z-10">
                  <DialogTitle className="text-xl font-black italic uppercase tracking-tight">
                    {editingId ? t('editEventTitle') : t('createEventTitle')}
                  </DialogTitle>
                  <DialogDescription className="font-medium text-slate-500 italic text-xs">
                    {editingId ? t('updateEventBtn') : t('placeholderDetails')}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 px-6 py-4 space-y-5">
                  <div className="space-y-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t('eventBannerLabel')}</Label>
                    <ImageUpload
                      value={selectedImage}
                      onUpload={async (file) => {
                        try {
                          const url = await uploadService.uploadImage(file);
                          setSelectedImage(url);
                        } catch {
                          // fallback: use base64 preview (stored locally only)
                          const reader = new FileReader();
                          reader.onloadend = () => setSelectedImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      onRemove={() => setSelectedImage(null)}
                      description={t('dragDrop')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="title_en" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Title (EN)</Label>
                      <Input 
                        id="title_en" 
                        placeholder="vd. HỘI THẢO AI 2026" 
                        className="border-slate-100 rounded-xl bg-slate-50 shadow-sm focus:bg-white transition-all h-10 text-sm"
                        value={formData.title_en}
                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="title_vi" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tiêu đề (VI)</Label>
                      <Input 
                        id="title_vi" 
                        placeholder="VD: HỘI THẢO AI 2026" 
                        className="border-slate-100 rounded-xl bg-slate-50 shadow-sm focus:bg-white transition-all h-10 text-sm"
                        value={formData.title_vi}
                        onChange={(e) => setFormData({ ...formData, title_vi: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="details_en" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Details (EN)</Label>
                      <textarea 
                        id="details_en" 
                        className="w-full min-h-[80px] border border-slate-100 rounded-xl bg-slate-50 shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                        value={formData.description_en}
                        onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="details_vi" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Chi tiết (VI)</Label>
                      <textarea 
                        id="details_vi" 
                        className="w-full min-h-[80px] border border-slate-100 rounded-xl bg-slate-50 shadow-sm px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                        value={formData.description_vi}
                        onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5 md:col-span-1">
                      <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('eventDateLabel')}</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        className="border-slate-100 rounded-lg bg-slate-50 shadow-sm h-10 text-[11px]"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                      <Label htmlFor="closingDate" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('eventClosingDateLabel')}</Label>
                      <Input 
                        id="closingDate" 
                        type="date" 
                        className="border-slate-100 rounded-lg bg-slate-50 shadow-sm h-10 text-[11px]"
                        value={formData.closingDate}
                        onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                      <Label htmlFor="time" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('eventTimeLabel')}</Label>
                      <Input 
                        id="time" 
                        type="time" 
                        className="border-slate-100 rounded-lg bg-slate-50 shadow-sm h-10 text-[11px]"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                      <Label htmlFor="capacity" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('eventCapacityLabel')}</Label>
                      <Input 
                        id="capacity" 
                        type="number" 
                        className="border-slate-100 rounded-lg bg-slate-50 shadow-sm h-10 text-[11px]"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="location_en" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Location (EN)</Label>
                      <Input 
                        id="location_en" 
                        className="border-slate-100 rounded-xl bg-slate-50 shadow-sm h-10 text-sm"
                        value={formData.location_en}
                        onChange={(e) => setFormData({ ...formData, location_en: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location_vi" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Địa điểm (VI)</Label>
                      <Input 
                        id="location_vi" 
                        className="border-slate-100 rounded-xl bg-slate-50 shadow-sm h-10 text-sm"
                        value={formData.location_vi}
                        onChange={(e) => setFormData({ ...formData, location_vi: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('displaySectionLabel')}</Label>
                      <Select
                        value={formData.displayCategory}
                        onValueChange={(value) => setFormData({ ...formData, displayCategory: value as 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL' })}
                      >
                        <SelectTrigger className="border-slate-100 rounded-xl bg-slate-50 shadow-sm h-10 focus:ring-red-500/20 text-[11px]">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-100 rounded-xl shadow-xl">
                          <SelectItem value="HERO" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">
                            Hero (Trang chủ)
                          </SelectItem>
                          <SelectItem value="FEATURED" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">
                            Featured (Nổi bật)
                          </SelectItem>
                          <SelectItem value="HIGHLIGHT" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">
                            Highlight (Tiêu điểm)
                          </SelectItem>
                          <SelectItem value="NORMAL" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">
                            Normal (Thông thường)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('eventCategoryLabel')}</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => { if (value) setFormData({ ...formData, category: value }) }}
                      >
                        <SelectTrigger className="border-slate-100 rounded-xl bg-slate-50 shadow-sm h-10 focus:ring-red-500/20 text-[11px]">
                          <SelectValue placeholder="Chọn thể loại" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-100 rounded-xl shadow-xl">
                          <SelectItem value="ACADEMIC" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">Học thuật</SelectItem>
                          <SelectItem value="CULTURE" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">Văn hóa</SelectItem>
                          <SelectItem value="SPORT" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">Thể thao</SelectItem>
                          <SelectItem value="COMMUNITY" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">Cộng đồng</SelectItem>
                          <SelectItem value="NATIONAL" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">Quốc gia</SelectItem>
                          <SelectItem value="SCHOOL" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">Nhà trường</SelectItem>
                          <SelectItem value="SEMINAR" className="text-xs font-bold uppercase tracking-widest focus:bg-red-50 focus:text-red-600 transition-colors py-2.5">Hội thảo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 sticky bottom-0 z-10 mt-0">
                  <Button 
                    type="submit" 
                    className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-lg border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all" 
                    onClick={handleCreateSubmit}
                  >
                    {editingId ? t('updateEventBtn') : t('confirmPublish')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <div className="w-2 h-2 rounded-full border-2 border-yellow-500"></div>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest italic">Đến VA và trải nghiệm những khoảnh khắc thú vị nhất!</p>
          <div className="h-[1px] w-48 bg-slate-100"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-x-8 gap-y-12 max-w-6xl mx-auto">
        {filteredEvents.map((event) => (
          <motion.div 
            key={event.id}
            whileHover={{ y: -5 }}
            onClick={() => router.push(`/events/${event.id}`)}
            className="group relative h-[380px] rounded-sm overflow-hidden shadow-2xl flex flex-col cursor-pointer"
          >
            {/* Top Half: Image */}
            <div className="flex-1 relative overflow-hidden">
               <img src={event.image} alt={resolve(event.title)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none text-[9px] font-black tracking-widest uppercase px-3 py-1.5 shadow-xl">
                    {event.category}
                  </Badge>
                </div>
            </div>
            
            {/* Bottom Half: Info */}
            <div className="h-[120px] bg-[#1e4e79] group-hover:bg-[#1a4369] transition-colors p-6 flex flex-col justify-between relative">
              {/* White overlay for content like screenshot */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1e4e79]/20 to-transparent" />
              
              <h3 className="text-lg font-black text-white italic leading-tight line-clamp-1 uppercase tracking-tighter relative z-10">
                {resolve(event.title)}
              </h3>
              
              <div className="flex justify-between items-end relative z-10">
                <div className="space-y-1">
                  <div className="text-[11px] font-black text-white uppercase tracking-widest">
                    {event.startTime} - {event.date}
                  </div>
                </div>
                {canCreate ? (
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                      onClick={() => handleEditClick(event)}
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-white/50 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {resolve(event.location)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}







