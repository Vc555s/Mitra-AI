"use client"
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { therapists } from '@/lib/dummyTherapists';
//font
import {DM_Sans} from "next/font/google";

const DMsansFont = DM_Sans({
  subsets: ["latin"],
})

// Define the Therapist interface directly in this file
export interface Therapist {
  id: number;
  name: string;
  specialisation: string[];
  disorders: string[];
  counselling: string[];
  experience: number;
}

const SelectedTherapistContent = () => {
  const searchParams = useSearchParams();
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const therapist = therapists.find(t => t.id === parseInt(id, 10));
      setSelectedTherapist(therapist || null);
    }
  }, [searchParams]);

  if (!selectedTherapist) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-xl text-gray-600">Therapist not found.</p>
        </div>
    );
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <section className='flex justify-center w-full bg-[#FAF6F3]'>
        <div className='container p-4 md:p-6'>
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl pl-10 font-medium tracking-tight text-[#403635]">
              We have found a great match for you!
            </h1>
          </div>
          <div className="flex justify-center">
            <Card className="rounded-3xl md:rounded-[85px] w-full max-w-5xl p-6 md:p-10 border-2 border-[#6B2A7D] shadow-[0_4px_4px_0_#8A882A0]/60 bg-[#F6D8D6]/50">
              <CardHeader className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 pb-4">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 flex-shrink-0">
                  <AvatarFallback className="bg-[#A882A0] text-white font-semibold text-3xl">{getInitials(selectedTherapist.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <CardTitle className="text-3xl md:text-4xl text-[#403635] font-bold pb-2">{selectedTherapist.name}</CardTitle>
                  <CardDescription className="text-[#403635] text-lg md:text-xl italic">
                    A dedicated professional with {selectedTherapist.experience} years of experience in helping individuals navigate life&apos;s challenges.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4 md:pt-0 md:pl-36">
                <div className="space-y-3 text-center md:text-left">
                    <p className="text-[#403635] text-lg md:text-xl"><strong>Specialisation:</strong> {selectedTherapist.specialisation.join(', ')}</p>
                    <p className="text-[#403635] text-lg md:text-xl"><strong>Focus Areas:</strong> {selectedTherapist.disorders.join(', ')}</p>
                    <p className="text-[#403635] text-lg md:text-xl"><strong>Counselling For:</strong> {selectedTherapist.counselling.join(', ')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className='review-section w-full max-w-5xl mx-auto px-4 md:px-6 py-8'>
        <div className='review-heading mb-4 text-center md:text-left'>
           <h3 className="scroll-m-20 text-[#403635] text-2xl font-semibold tracking-tight">
              Here’s what people had to say:
            </h3>
        </div>
        <Card className='bg-transparent shadow-none border-none'>
          <CardContent className="p-0">
            <blockquote className="text-[#403635] border-l-4 border-[#A882A0] pl-6 italic">
              &quot;Dr. {selectedTherapist.name.split(' ').pop()} has a way of asking questions that linger in your mind long after the session. 
              Their approach helped me realize so much about myself. 
              I feel like I&apos;m finally rewriting my own story.&quot;
            </blockquote>
          </CardContent>
        </Card>
      </section>
    </>
  );
}


const SelectedTherapistPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm z-10 border-b border-gray-200">
                <div className="navbar bg-transparent max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="navbar-start" />
                    <div className="navbar-center">
                        <h1 className="text-3xl md:text-5xl text-[#CE2746] font-bold">Heart Line</h1>
                    </div>
                    <div className="navbar-end" />
                </div>
            </header>
            <main className="flex-1 flex flex-col items-center">
                <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><p>Loading therapist...</p></div>}>
                    <SelectedTherapistContent />
                </Suspense>
            </main>
        </div>
    );
}

export default SelectedTherapistPage;