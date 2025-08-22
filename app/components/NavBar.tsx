"use client";

import { useRouter } from "next/navigation";
import {
  HeartHandshake,
  Home,
  MessageCircleHeart,
  Settings,
  Smile,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Home",
    url: "../main-app/Home",
    icon: Home,
  },
  {
    title: "MitraAI",
    url: "../main-app/ai-chat-ui",
    icon: MessageCircleHeart,
  },
  {
    title: "Mood Journal",
    url: "../main-app/mood-journal",
    icon: Smile,
  },
  {
    title: "HeartLine",
    url: "../main-app/heart-line",
    icon: HeartHandshake,
  },
  {
    title: "Settings",
    url: "../main-app/settings",
    icon: Settings,
  },
];

export function NavBar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col justify-between h-full">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel>Mitra AI</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
