"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"

export function DropDown() {
  const [mode, setMode] = React.useState("one")

  const colorMap: Record<string, string> = {
    one: "bg-[#A8968B]",
    two: "bg-[#7A8BA8]",
    three: "bg-[#B8704A]",
    four: "bg-[#710A2F]",
  }

  const labelMap: Record<string, string> = {
    one: "Supportive",
    two: "Educational",
    three: "Solution-focused",
    four: "Challenging",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-10 transition-all duration-300 ease-in-out rounded-full w-10 md:w-40 flex items-center justify-center md:justify-start gap-2 px-0 md:px-4 bg-[#F6D8D6]/50 hover:bg-[#F6D8D6]/70 border-2 border-transparent text-[#3B3D40] font-medium text-xs md:text-sm"
          variant="outline"
        >
          <span className={`flex-shrink-0 w-3 h-3 rounded-full ${colorMap[mode]}`} />
          <span className="hidden md:inline truncate">{labelMap[mode]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#FDEBE9]">
        <DropdownMenuLabel className="text-xs md:text-sm">Select a conversation style</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(labelMap).map(([value, label]) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setMode(value)}
            className="pl-4 pr-2 flex items-center gap-2 cursor-pointer text-xs md:text-sm"
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorMap[value] }} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
    
}

