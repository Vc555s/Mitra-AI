"use client";
import React from "react";
import ScrollStack from '../../src/components/lightswind/scroll-stack';
import { MessageCircleHeart, Smile, HeartHandshake} from 'lucide-react';



const Features = () => {
  const cards = [
    {
      content: (
        <div>
          <div className="flex items-center gap-4 mb-2">
            <MessageCircleHeart className="h-10 w-10 text-[#403635]" />
            <h1 className="text-5xl font-bold text-[#403635] font-DMSans">MitraAI</h1>
          </div>
          <p>Chat with our AI companion to explore your thoughts</p>
        </div>
      )
    },
    {
      content: (
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Smile className="h-10 w-10 text-[#403635]" />
            <h1 className="text-5xl font-bold text-[#403635] font-DMSans">Mood Journal</h1>
          </div>
          <p>Reflect on your day and track your emotional journey</p>
        </div>
      )
    },
    {
      content: (
        <div>
          <div className="flex items-center gap-4 mb-2">
            <HeartHandshake className="h-10 w-10 text-[#403635]" />
            <h1 className="text-5xl font-bold text-[#403635] font-DMSans">HeartLine</h1>
          </div>
          <p>Connect with a professional therapist for guidance</p>
        </div>
      )
    },
  ];
  return (
    <section className="min-h-screen bg-[#FAF6F3] text-[#403635] font-DMSans">
      <ScrollStack cards={cards} />
    </section>
  );
};

export default Features;
