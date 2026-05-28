'use client'

import { useRouter } from 'next/navigation';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mail, Calendar, CheckCircle2, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { toast } from 'sonner';

export default function PersonalInfo() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const isStudent = user?.role === UserRole.STUDENT;
  const isAdmin = user?.role === UserRole.ADMIN;

  const handleImageUpload = (file: File) => {
    // In a real app, you would upload this to Firebase Storage or your server
    console.log('Uploading file:', file.name);
    toast.success('Profile picture updated (simulated)');
  };

  const handleImageRemove = () => {
    toast.info('Profile picture removed');
  };

  const userInfo = [
    { label: 'Họ và tên', value: user?.displayName || '' },
    { label: isStudent ? 'MSSV - Tên - Lớp' : 'Mã hệ thống - Tên', value: `${user?.schoolId || ''} - ${user?.displayName || ''}${isStudent ? ' - 71K29CNTT07' : ''}` },
    { label: 'Địa chỉ Email', value: user?.email || '' },
    { label: isStudent ? 'Khoa' : 'Vai trò', value: isStudent ? 'Khoa Công nghệ thông tin' : (user?.role || '') }
  ];

  return (
    <div className="space-y-8">
      {/* Support Header - Only for students */}
      {isStudent && (
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        {!isAdmin && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                <Link href="/my-events" className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group">
                  <Calendar className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#1e3a5f]">
                    {t('myEvent')}
                  </span>
                </Link>
                <Link href="/participated-events" className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group">
                  <CheckCircle2 className="h-4 w-4 text-slate-400 group-hover:text-green-600" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#1e3a5f]">
                    {t('participationInEvent')}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={cn(isAdmin ? "lg:col-span-4" : "lg:col-span-3")}>
          <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-[#1e3a5f] p-3">
              <h3 className="text-white text-[11px] font-black uppercase tracking-widest">
                {t('personalInfo')}
              </h3>
            </div>
            <div className="p-4 md:p-8 bg-slate-50/30 space-y-8">
              {/* Profile Image Section */}
              <div className="bg-white p-4 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-full md:w-1/3">
                  <ImageUpload 
                    label={t('profilePicture')}
                    onUpload={handleImageUpload}
                    onRemove={handleImageRemove}
                    description={t('uploadImage')}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[#1e3a5f] text-[12px] font-black uppercase tracking-widest">{t('profilePicture')}</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-sm">
                    {t('footerDesc')}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 md:p-8 border border-slate-100 space-y-4 shadow-sm">
                {userInfo.map((info, index) => (
                  <div key={index} className="border border-slate-100 p-4 rounded-sm flex flex-col md:flex-row md:items-center bg-white shadow-sm gap-2 md:gap-0">
                    <span className="text-[#1e3a5f] text-[11px] font-black uppercase tracking-widest md:min-w-[200px] md:border-r md:border-slate-50 md:mr-6 shrink-0">
                      {info.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight break-all">
                      {info.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








