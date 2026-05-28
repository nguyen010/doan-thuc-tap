"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar, Share2, Activity, Users, TrendingUp, BarChart3 } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { motion } from "motion/react"
import { useOverviewStats } from "@/hooks/use-stats-api"

const attendanceData = [
  { name: "Mon", present: 45, absent: 5 },
  { name: "Tue", present: 52, absent: 8 },
  { name: "Wed", present: 61, absent: 4 },
  { name: "Thu", present: 58, absent: 12 },
  { name: "Fri", present: 70, absent: 10 },
  { name: "Sat", present: 85, absent: 15 },
  { name: "Sun", present: 40, absent: 5 },
]

const eventTypeData = [
  { name: "Conferences", value: 40 },
  { name: "Workshops", value: 30 },
  { name: "Summits", value: 20 },
  { name: "Seminars", value: 10 },
]

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#f43f5e']

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ReportsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { data: stats = { totalUsers: 0, totalEvents: 0, totalCheckins: 0, checkInRate: 0, totalRegistrations: 0 } } = useOverviewStats()

  useEffect(() => { setIsMounted(true) }, [])

  const metrics = [
    { label: "Tổng sinh viên", value: stats.totalUsers.toLocaleString(), change: "", icon: Users, color: "text-indigo-500" },
    { label: "Tổng sự kiện", value: String(stats.totalEvents), change: "", icon: BarChart3, color: "text-cyan-500" },
    { label: "Tổng lượt điểm danh", value: String(stats.totalCheckins), change: "", icon: Activity, color: "text-rose-500" },
    { label: "Tỷ lệ điểm danh TB", value: `${stats.checkInRate}%`, change: "", icon: TrendingUp, color: "text-emerald-500" },
  ]

  const handleDownloadReport = () => {
    const reportDate = new Date().toLocaleDateString('vi-VN')
    let content = `BÁO CÁO HIỆU QUẢ SỰ KIỆN - ${reportDate}\n`
    content += `==========================================\n\n`
    content += `1. CHỈ SỐ HIỆU SUẤT\n-------------------\n`
    content += `- Tổng sinh viên: ${stats.totalUsers.toLocaleString()}\n`
    content += `- Tổng sự kiện: ${stats.totalEvents}\n`
    content += `- Tổng lượt điểm danh: ${stats.totalCheckins}\n`
    content += `- Tỷ lệ điểm danh trung bình: ${stats.checkInRate}%\n\n`
    content += `2. THEO DÕI ĐIỂM DANH (7 NGÀY QUA)\n---------------------------------\n`
    attendanceData.forEach(d => { content += `${d.name}: Có mặt: ${d.present} | Vắng: ${d.absent}\n` })
    content += `\n3. PHÂN BỔ SỰ KIỆN THEO DANH MỤC\n--------------------------------\n`
    eventTypeData.forEach(d => { content += `${d.name}: ${d.value}%\n` })
    content += `\n\n--- Hết báo cáo ---`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Báo cáo & Thống kê</h1>
          <p className="text-sm text-slate-500">Phân tích chi tiết hiệu quả sự kiện.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none active:scale-95 transition-transform">
            <Share2 className="mr-2 h-4 w-4" /> Chia sẻ
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none active:scale-95 transition-transform" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" /> Tải báo cáo
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-sm shadow-black/5 bg-background/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Theo dõi Điểm danh</CardTitle>
              <CardDescription>Trực quan hóa lượng điểm danh so với lượt đăng ký trong tuần qua.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8">
                <Calendar className="mr-2 h-4 w-4" /> 7 ngày qua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="#94a3b8" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="present" name="Đã điểm danh" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="absent" name="Vắng mặt" fill="#94a3b8" opacity={0.2} radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-black/5 bg-background/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Phân bổ Sự kiện</CardTitle>
            <CardDescription>Phân chia theo danh mục sự kiện.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center">
            <div className="h-[350px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={eventTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm shadow-black/5 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Chỉ số Hiệu suất</CardTitle>
            <CardDescription>Các chỉ số chính so với kỳ trước.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 pb-4">
              {metrics.map((metric, i) => (
                <div key={i} className="space-y-2 p-4 rounded-2xl bg-white/50 border border-white hover:bg-white transition-colors group">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{metric.label}</p>
                    <metric.icon className={`w-4 h-4 ${metric.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{metric.value}</p>
                  <p className={`text-[10px] ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'} font-bold flex items-center`}>
                    {metric.change} <span className="text-slate-400 font-medium ml-1.5 uppercase tracking-tighter">so với kỳ trước</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
