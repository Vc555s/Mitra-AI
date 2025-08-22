"use client"
import React from 'react';
import Image from 'next/image';
import BlurText from '@/components/BlurText';
import AnimatedContent from '@/components/AnimatedContent';
import FadeContent from '@/components/FadeContent';
  


//font
import {DM_Sans} from "next/font/google";
const DMsansFont = DM_Sans({
  subsets: ["latin"],
})



const handleAnimationComplete = () => {
  console.log('Animation completed!');
};


const Hero = () => {
  return (
    <section
      className={`${DMsansFont.className} relative min-h-screen bg-[#FAF6F3] overflow-hidden flex items-end justify-center`}
    >
      {/* Radial Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[1200px] h-[1100px] bg-[#D8A39D] opacity-30 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Content pinned to bottom */}
      <div className="z-10 flex flex-col items-center text-center">
        <BlurText
          text="MitraAI"
          delay={200}
          animateBy="letters"
          direction="top"
          onAnimationComplete={handleAnimationComplete}
          className="text-8xl font-bold text-[#403635]"
        />
        
        <FadeContent blur={true} duration={1000} delay={200} easing="ease-out" initialOpacity={0}>
          <p className="italic text-xl text-[#403635] mt-2">your friend in need</p>
        </FadeContent>
        <AnimatedContent
          distance={150}
          direction="vertical"
          reverse={false}
          duration={0.8}
          ease="power3.out"
          initialOpacity={0.2}
          animateOpacity
          scale={1.1}
          threshold={0.2}
          delay={0.3}
        >
            <Image
            src="/LandingPageLogo.svg"
            alt="MitraAI logo"
            width={500}
            height={500}
            className="mt-16"
          />
        </AnimatedContent>
      </div>
    </section>
  );
};


export default Hero