"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, CheckCircle2, Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useEventQuery } from "@/hooks/use-events-api"
import { useEventRegistrations } from "@/hooks/use-registrations-api"
import { apiClient } from "@/lib/api-client"

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [search, setSearch] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await apiClient.get(`/events/${id}/export`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `Event_${id}_Participants.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      alert('Xuất file thất bại. Vui lòng thử lại.')
    } finally {
      setIsExporting(false)
    }
  }

  const { data: event, isLoading: loadingEvent } = useEventQuery(id)
  const { data: registrations = [], isLoading: loadingRegs } = useEventRegistrations(id)

  const checkedIn = registrations.filter(r => r.status === 'ĐÃ ĐIỂM DANH')
  const completionRate = event && event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0
  const checkInRate = event && event.registeredCount > 0 ? Math.round((checkedIn.length / event.registeredCount) * 100) : 0

  const filteredRegs = registrations.filter(r =>
    r.userName.toLowerCase().includes(search.toLowerCase()) ||
    r.studentId.toLowerCase().includes(search.toLowerCase())
  )

  if (loadingEvent) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-400 italic">Đang tải...</div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <p className="text-slate-500">Không tìm thấy sự kiện</p>
        <Button onClick={() => router.push("/dashboard")}>Quay lại tổng quan</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 sm:h-9 sm:w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">{event.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 truncate">Chi tiết lượt đăng ký và điểm danh thực tế</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng đăng ký</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{event.registeredCount} / {event.capacity}</div>
            <Progress value={completionRate} className="h-1.5 sm:h-2 mt-3 sm:mt-4 bg-slate-100 rounded-full" indicatorClassName="bg-indigo-600" />
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 font-semibold uppercase">{completionRate}% HOÀN THÀNH</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Đã điểm danh</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">{checkedIn.length} người</div>
            <Progress value={checkInRate} className="h-1.5 sm:h-2 mt-3 sm:mt-4 bg-slate-100 rounded-full" indicatorClassName="bg-emerald-500" />
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 font-semibold uppercase">{checkInRate}% TỶ LỆ ĐIỂM DANH</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 pt-1 sm:pt-2 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
              <span className="font-medium text-slate-700">{event.status}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6">
          <div>
            <CardTitle className="text-lg sm:text-xl">Danh sách người tham gia</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Hiển thị tất cả những người đã đăng ký.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9 h-9 text-sm" placeholder="Tìm kiếm MSSV hoặc tên..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="h-9 px-3 shrink-0 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 mr-1.5" />
              {isExporting ? 'Đang xuất...' : 'Excel'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {loadingRegs ? (
            <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">Đang tải...</div>
          ) : (
            <div className="sm:rounded-md sm:border overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="px-4 sm:px-6">Họ và tên</TableHead>
                    <TableHead>MSSV</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Ngày đăng ký</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegs.length > 0 ? filteredRegs.map(reg => (
                    <TableRow key={reg.id} className="hover:bg-slate-50/55 transition-colors">
                      <TableCell className="px-4 sm:px-6 font-semibold text-sm text-slate-900">{reg.userName}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{reg.studentId}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-slate-500">{reg.userEmail}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-slate-500">
                        {new Date(reg.registrationDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        {reg.status === 'ĐÃ ĐIỂM DANH' ? (
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[10px] rounded-full px-2">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Có mặt
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] rounded-full px-2">{reg.status}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic text-sm">
                        Chưa có người tham gia.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
