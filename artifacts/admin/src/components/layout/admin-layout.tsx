import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { LayoutDashboard, Calendar, Image as ImageIcon, FileText, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="py-4">
          <Link href="/dashboard" className="flex items-center gap-2 px-2 text-sidebar-primary">
            <img src={`${basePath}/logo.svg`} alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-bold">Admin</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location === "/dashboard"}>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.startsWith("/events")}>
                <Link href="/events">
                  <Calendar />
                  <span>Events</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.startsWith("/gallery")}>
                <Link href="/gallery">
                  <ImageIcon />
                  <span>Gallery</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.startsWith("/posts")}>
                <Link href="/posts">
                  <FileText />
                  <span>Posts</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="py-4">
          <div className="px-2 text-xs text-sidebar-foreground/70 mb-2 truncate">
            {user?.primaryEmailAddress?.emailAddress}
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => signOut({ redirectUrl: basePath || "/" })}>
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b px-4 bg-card">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
