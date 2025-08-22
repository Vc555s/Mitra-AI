"use client"

import React from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea" 
//font
import {DM_Sans} from "next/font/google";

const DMsansFont = DM_Sans({
  subsets: ["latin"],
})

const FormSchema = z.object({
  entry: z.string().min(5, {
    message: "Your journal entry must be at least 5 characters.",
  }),
})

const MoodJournal = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      entry: "",
    },
  })

  // Replace with actual user id logic as needed
  const userId = "alex-uid";

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const res = await fetch("http://localhost:8000/api/mood/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, desc: data.entry }),
      });
      if (res.ok) {
        toast("Journal Entry Submitted", {
          description: (
            <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
              <code className="text-white whitespace-pre-wrap">
                {data.entry}
              </code>
            </pre>
          ),
        });
        form.reset();
      } else {
        toast.error("Failed to save journal entry.");
      }
    } catch {
      toast.error("Failed to save journal entry.");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF6F3] font-sans">
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="navbar bg-transparent max-w-5xl mx-auto px-4">
          <div className="navbar-start">
            {/* Sidebar toggle would go here if needed */}
          </div>
          <div className="navbar-center">
            <h1 className="text-3xl md:text-5xl text-[#CE2746] font-bold">Mood Journal</h1>
          </div>
          <div className="navbar-end">
            {/* Right-aligned items would go here */}
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 pt-12 md:pt-20">
          <div className="w-full max-w-4xl">
            <p className="text-base md:text-xl font-medium text-gray-700 mb-6 text-center md:text-left">
              <span className="font-semibold text-2xl text-[#403635]">Today's Prompt: </span> What's one thing you would have done differently today?
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <FormField
                  control={form.control}
                  name="entry"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Write your thoughts here..."
                          className="min-h-[250px] text-base rounded-2xl bg-[#F7DEEE]/40 border-0 p-6 focus-visible:ring-2 focus-visible:ring-[#BC2440]/50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs md:text-sm pt-2 text-right">
                        Be honest with yourself — no one else will see this.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" className="rounded-full bg-[#F7DEEE] text-[#3B3D40] hover:bg-[#BC2440] hover:text-white transition-colors">Save Entry</Button>
                </div>
              </form>
            </Form>
          </div>
      </main>
    </div>
  )
}

export default MoodJournal