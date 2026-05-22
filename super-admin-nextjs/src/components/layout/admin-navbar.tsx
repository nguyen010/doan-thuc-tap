"use client"

import { Bell, Search, Settings, HelpCircle, User, LogOut, Key, Shield, Smartphone, BellRing, Palette, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/use-auth-store"
import { useRouter } from "next/navigation"

export function AdminNavbar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="flex shrink-0" />
        <div className="hidden sm:flex relative items-center bg-slate-100 rounded-lg px-3 py-1.5 w-48 lg:w-96">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-transparent border-none text-sm ml-2 outline-none w-full text-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
        </Button>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                <AvatarFallback>QT</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal px-2 py-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-slate-900">{user?.name || "Quản trị viên"}</p>
                  <p className="text-[11px] leading-none text-slate-500 font-medium">
                    {user?.email || "admin@university.edu.vn"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1.5">Thông tin</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Xem hồ sơ</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Quyền hạn</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1.5">Bảo mật</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Key className="mr-2 h-4 w-4" />
                        <span>Đổi mật khẩu</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Smartphone className="mr-2 h-4 w-4" />
                        <span>Xác thực 2 lớp</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt hệ thống</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1.5">Tùy chọn</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <BellRing className="mr-2 h-4 w-4" />
                        <span>Thông báo</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Palette className="mr-2 h-4 w-4" />
                        <span>Giao diện</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Globe className="mr-2 h-4 w-4" />
                        <span>Ngôn ngữ</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 font-medium" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
