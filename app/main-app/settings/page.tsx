"use client";

import React from 'react';
import { Mail, Bell, Lock, FileText, Trash2, ChevronRight, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SettingsPage = () => {

  const SettingRow = ({ icon, title, description, action }: { icon: React.ElementType, title: string, description?: string, action: React.ReactNode }) => {
    const Icon = icon;
    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Icon className="h-5 w-5 text-gray-500" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{title}</span>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>
        <div>
          {action}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm z-10 border-b border-gray-200">
        <div className="navbar bg-transparent max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="navbar-start" />
          <div className="navbar-center">
            <h1 className="text-3xl md:text-5xl text-[#CE2746] font-bold">Settings</h1>
          </div>
          <div className="navbar-end" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-12">
          {/* Profile Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile</h2>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2 flex-1 w-full">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Alex Doe" />
                </div>
              </div>
              <Separator />
              <SettingRow 
                icon={Mail}
                title="Email"
                action={<Input type="email" defaultValue="alex.doe@example.com" className="text-right border-0 shadow-none focus-visible:ring-0 bg-transparent" />}
              />
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Notifications</h2>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm">
              <SettingRow 
                icon={Bell}
                title="Push Notifications"
                description="Receive updates on your mobile device."
                action={<Switch defaultChecked />}
              />
              <Separator />
               <SettingRow 
                icon={Mail}
                title="Email Updates"
                description="Get weekly summaries and tips."
                action={<Switch />}
              />
            </div>
          </section>

          {/* Account Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Account</h2>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm">
              <SettingRow 
                icon={Lock}
                title="Change Password"
                action={<Button variant="ghost" size="icon"><ChevronRight className="h-5 w-5 text-gray-500" /></Button>}
              />
              <Separator />
              <SettingRow 
                icon={FileText}
                title="Privacy Policy"
                action={<Button variant="ghost" size="icon"><ChevronRight className="h-5 w-5 text-gray-500" /></Button>}
              />
               <Separator />
              <SettingRow 
                icon={Trash2}
                title="Delete Account"
                action={<Button variant="destructive" size="sm">Delete</Button>}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
