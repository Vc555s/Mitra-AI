"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { MessageCircleHeart, Smile, HeartHandshake, ArrowRight } from 'lucide-react';

//font
import {DM_Sans} from "next/font/google";

const DMsansFont = DM_Sans({
  subsets: ["latin"],
})

// Mock data
const mockData = {
  userName: "Alex",
  lastJournalEntry: {
    snippet: "Felt a real sense of calm after my morning walk. It's the small moments that seem to make the biggest difference lately.",
    keywords: ["Calm", "Peaceful", "Focused"]
  }
};

// Fallback emotions for new users
const fallbackEmotions = ["Curious", "Hopeful", "Inspired"];

// A component to mimic the "BlurIn" text effect from react-bits
const BlurInText = ({ text, className }: { text: string, className?: string }) => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.2 }
        }
    };
    const letterVariants: Variants = {
        hidden: { opacity: 0, filter: 'blur(10px)' },
        visible: { opacity: 1, filter: 'blur(0px)' }
    };
    return (
        <motion.h2
            className={`text-center ${DMsansFont.className} ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {text.split('').map((char, index) => (
                <motion.span key={index} variants={letterVariants}>
                    {char}
                </motion.span>
            ))}
        </motion.h2>
    );
};

const HomePage = () => {
  const [animationStep, setAnimationStep] = useState(0);
  const [recentEmotions, setRecentEmotions] = useState<string[]>([]);

  // Replace with actual user id logic
  const userId = "alex-uid";

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStep(1);
    }, 2500); // Wait 2.5 seconds before pushing the text up
    return () => clearTimeout(timer);
  }, []);

  // Fetch recent emotions from backend
  useEffect(() => {
    fetch(`http://localhost:8000/api/mood/recent-emotions/${userId}?limit=3`)
      .then(res => res.json())
      .then(data => {
        if (data && data.recent_emotions && Array.isArray(data.recent_emotions) && data.recent_emotions.length > 0) {
          // Flatten all emotion arrays from each entry
          const emotionsArr: string[] = [];
          data.recent_emotions.forEach((item: { emotions: string[] }) => {
            if (Array.isArray(item.emotions)) {
              item.emotions.forEach(e => {
                if (e && typeof e === "string") emotionsArr.push(e.trim());
              });
            }
          });
          if (emotionsArr.length > 0) {
            setRecentEmotions(emotionsArr.slice(0, 3));
          } else {
            setRecentEmotions(fallbackEmotions);
          }
        } else {
          setRecentEmotions(fallbackEmotions);
        }
      })
      .catch(() => setRecentEmotions(fallbackEmotions));
  }, [userId]);

  const navigateTo = (path: string) => {
    console.log(`Navigating to: ${path}`);
  };

  const featureCardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const FeatureCard = ({ icon, title, description, path, color }: { icon: React.ElementType, title: string, description: string, path: string, color: string }) => {
    const Icon = icon;
    return (
      <motion.div
        variants={featureCardVariants}
        onClick={() => navigateTo(path)}
        className={` ${DMsansFont.className} group relative flex flex-col justify-between p-6 rounded-2xl shadow-lg cursor-pointer ${color}`}
      >
        <div>
          <div className="mb-4"><Icon className="h-8 w-8 md:h-10 md:w-10 text-white" /></div>
          <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
          <p className="text-white/80 mt-2 text-sm md:text-base">{description}</p>
        </div>
        <div className="mt-6"><ArrowRight className="h-6 w-6 text-white/50 transition-transform duration-300 group-hover:translate-x-1" /></div>
      </motion.div>
    );
  };

  return (
    <div className={`${DMsansFont.className} flex flex-col min-h-screen bg-[#FAF6F3] font-sans`}>
      <header className="flex-shrink-0 bg-transparent backdrop-blur-sm z-10">
        <div className="navbar bg-transparent max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence>
          {animationStep === 0 && (
            <motion.div
              key="welcome"
              className="fixed inset-0 flex items-center justify-center p-4"
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <BlurInText text={`Welcome back, ${mockData.userName}`} className="text-3xl md:text-4xl font-bold text-[#6B2A7D] text-center" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
            className="transition-opacity duration-1000"
            style={{ opacity: animationStep === 1 ? 1 : 0 }}
        >
            <motion.div
                layout
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="text-center mb-4"
            >
                <h2 className={`${DMsansFont.className} text-3xl md:text-5xl font-bold text-[#6B2A7D]`}>
                    Welcome back, {mockData.userName}
                </h2>
            </motion.div>
            
            <motion.section 
                className="mb-12"
                initial="hidden"
                animate={animationStep === 1 ? "visible" : "hidden"}
                variants={{
                    visible: { transition: { staggerChildren: 0.4, delayChildren: 0.8 } }
                }}
            >
                <motion.h3 
                    className="text-lg md:text-2xl font-semibold text-[#403635] mb-8 text-center md:text-center"
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                    Last time you felt 
                </motion.h3>

                <motion.div 
                    className="text-center md:text-left mb-5"
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                    <div className="flex justify-center md:justify-center flex-wrap gap-3 sm:gap-4">
                        {recentEmotions.map((keyword, index) => (
                            <motion.div
                              key={keyword + index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={animationStep === 1 ? "visible" : "hidden" }
                              variants={{ visible: { opacity: 1, y: 0 } }}
                              transition={{ duration: 0.5, delay: 1.5 + index * 0.2 }}
                              className="bg-[#F6D8D6] text-[#403635] text-lg md:text-2xl font-normal w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-center shadow-lg shadow-[#A882A0]/30 p-6 mr-7"
                            >
                              {keyword}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.section>
            
            <motion.h3 
                    className="text-lg md:text-2xl font-semibold text-[#403635] mb-4 text-center md:text-center"
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                    Why don't you?
            </motion.h3>

            <motion.section 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
                initial="hidden"
                animate={animationStep === 1 ? "visible" : "hidden"}
                variants={{
                    visible: { transition: { staggerChildren: 0.2, delayChildren: 2.5 } }
                }}
            >
                <FeatureCard icon={MessageCircleHeart} title="MitraAI" description="Chat with your AI companion to explore your thoughts." path="/ai-chat-ui" color="bg-[#A882A0]" />
                <FeatureCard icon={Smile} title="Mood Journal" description="Reflect on your day and track your emotional journey." path="/mood-journal" color="bg-[#A882A0]" />
                <FeatureCard icon={HeartHandshake} title="Heart Line" description="Connect with a professional therapist for guidance." path="/heart-line" color="bg-[#A882A0]" />
            </motion.section>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;