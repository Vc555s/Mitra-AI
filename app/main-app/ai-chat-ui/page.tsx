// /*after convo integration*/
// 'use client'
// import React, { useState } from 'react';
// import { DropDown } from '../../components/DropDown';
// import ChatComponent from '../../components/ChatBubble';
// import { ChatTextInput } from '../../components/ChatTextInput';
// import { ChatVoiceInput } from '../../components/ChatVoiceInput';
// import SuggestedPrompts from '@/app/components/SuggestedPrompts';

// //font
// import {DM_Sans} from "next/font/google";

// const DMsansFont = DM_Sans({
//   subsets: ["latin"],
// })

// interface Message {
//   content: string;
//   isUser: boolean;
// }

// const MindTalk = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // This handler is used for both text and voice input
//   const handleSendMessage = async (message: string) => {
//     try {
//         setIsLoading(true);
//         setMessages(prev => [...prev, { content: message, isUser: true }]);

//         const response = await fetch('http://localhost:8000/api/chat', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json'
//             },
//             credentials: 'include',  // Add this for session cookies
//             body: JSON.stringify({
//                 user_id: "user123",
//                 message: message
//             })
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         setMessages(prev => [...prev, { content: data.response, isUser: false }]);
//     } catch (error) {
//         console.error('Error:', error);
//         // Show error to user
//         setMessages(prev => [...prev, { 
//             content: "Sorry, I'm having trouble connecting. Please try again.", 
//             isUser: false 
//         }]);
//     } finally {
//         setIsLoading(false);
//     }
// };

//   // Fix: define handleTranscript to use handleSendMessage for voice input
//   const handleTranscript = (transcript: string) => {
//     handleSendMessage(transcript);
//   };

//    return (
//     <div className="flex h-screen bg-[#FAF6F3]">
//       <main className="flex-1 flex flex-col h-screen w-full overflow-hidden">
        
//         {/* Header */}
//         <header className="flex-shrink-0 bg-[#FAF6F3]/80 backdrop-blur-sm z-10">
//             <div className="navbar bg-transparent max-w-5xl mx-auto px-4 md:px-5">
//                  <div className="navbar-start"></div>
//                  <div className="navbar-center">
//                     <h1 className={`${DMsansFont.className} text-4xl md:text-5xl text-[#6B2A7D] font-semibold`}>MindTalk</h1>
//                  </div>
//                  <div className="navbar-end">
//                     <DropDown />
//                  </div>
//             </div>
//         </header>

//         {/* Chat & Prompts Area */}
//         <div className="flex-1 flex flex-col items-center overflow-y-auto">
//           <div className="w-full max-w-5xl mx-auto px-4">
//              <div className="py-8">
//                 <ChatComponent messages={messages} />
//              </div>
//           </div>
          
//           {/* Suggested prompts appear below the chat area */}
//           <div className="w-full mt-auto">
//             <SuggestedPrompts />
//           </div>
//         </div>

//         {/* Footer */}
//         <footer className="flex-shrink-0 bg-[#FAF6F3] pt-3 pb-4 border-none">
//           <div className="max-w-4xl mx-auto px-4">
//             <div className="flex w-full items-center gap-2 md:gap-4">
//               <div className="flex-1">
//                 <ChatTextInput onSendMessage={handleSendMessage} />
//               </div>
//               <ChatVoiceInput onVoiceInput={(transcript: string) => handleTranscript(transcript)} />  {/* for voice input */}
//             </div>
//           </div>
//         </footer>
//       </main>
//     </div>
//   );
// }

// export default MindTalk

// /*after voice integration*/

// 'use client'
// import React, { useState } from 'react';
// import { DropDown } from '../../components/DropDown';
// import ChatComponent from '../../components/ChatBubble';
// import { ChatTextInput } from '../../components/ChatTextInput';
// import { ChatVoiceInput } from '../../components/ChatVoiceInput';
// import SuggestedPrompts from '@/app/components/SuggestedPrompts';
// import { ChatAudioResponse } from '@/app/components/ChatAudioResponse';

// //font
// import {DM_Sans} from "next/font/google";

// const DMsansFont = DM_Sans({
//   subsets: ["latin"],
// })

// interface Message {
//   content: string;
//   isUser: boolean;
//   emotion?: {
//     dominant: string;
//     confidence: number;
//   };
// }

// interface EmotionData {
//   dominant: string;
//   confidence: number;
//   all_emotions?: Record<string, number>;
//   method?: string;
// }

// const MindTalk = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
//   // TTS state variables
//   const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);

//   // TTS function
//   const playTextToSpeech = async (text: string) => {
//     if (!isVoiceOutputEnabled || isPlaying) return;
    
//     try {
//       setIsPlaying(true);
//       const response = await fetch('http://localhost:8000/api/text-to-speech', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text })
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         const audio = new Audio(`data:audio/mpeg;base64,${data.audio_data}`);
//         audio.onended = () => setIsPlaying(false);
//         await audio.play();
//       }
//     } catch (error) {
//       console.error('TTS error:', error);
//       setIsPlaying(false);
//     }
//   };

//   // This handler is used for both text and voice input
//   const handleSendMessage = async (message: string, emotionData?: EmotionData) => {
//     try {
//         setIsLoading(true);
        
//         // Add user message with emotion data if available
//         const userMessage: Message = { 
//           content: message, 
//           isUser: true,
//           emotion: emotionData ? {
//             dominant: emotionData.dominant,
//             confidence: emotionData.confidence
//           } : undefined
//         };
        
//         setMessages(prev => [...prev, userMessage]);

//         // Update current emotion state for UI display
//         if (emotionData) {
//           setCurrentEmotion(emotionData);
//           console.log(`💭 Detected emotion: ${emotionData.dominant} (${(emotionData.confidence * 100).toFixed(1)}%)`);
//         }

//         const requestBody: any = {
//           user_id: "user123",
//           message: message
//         };

//         // Include emotion data in request if available
//         if (emotionData) {
//           requestBody.emotion_data = emotionData;
//         }

//         const response = await fetch('http://localhost:8000/api/chat', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json'
//             },
//             credentials: 'include',  // Add this for session cookies
//             body: JSON.stringify(requestBody)
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         setMessages(prev => [...prev, { content: data.response, isUser: false }]);
        
//         // Play AI response if voice output is enabled
//         if (isVoiceOutputEnabled) {
//           await playTextToSpeech(data.response);
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         // Show error to user
//         setMessages(prev => [...prev, { 
//             content: "Sorry, I'm having trouble connecting. Please try again.", 
//             isUser: false 
//         }]);
//     } finally {
//         setIsLoading(false);
//     }
//   };

//   // Updated handler for voice input with emotion data
//   const handleVoiceInput = (transcript: string, emotionData?: any) => {
//     if (transcript) {
//       handleSendMessage(transcript, emotionData);
//     }
//   };

//   // Helper function to get emotion color for UI indication
//   const getEmotionColor = (emotion?: string) => {
//     if (!emotion) return '#D8A39D';
    
//     const emotionColors: Record<string, string> = {
//       happiness: '#4ade80', // green
//       sadness: '#60a5fa',   // blue
//       anger: '#f87171',     // red
//       fear: '#a78bfa',      // purple
//       surprise: '#fbbf24',  // yellow
//       disgust: '#34d399',   // emerald
//       neutral: '#9ca3af'    // gray
//     };
    
//     return emotionColors[emotion.toLowerCase()] || '#D8A39D';
//   };

//    return (
//     <div className="flex h-screen bg-[#FAF6F3]">
//       <main className="flex-1 flex flex-col h-screen w-full overflow-hidden">
        
//         {/* Header */}
//         <header className="flex-shrink-0 bg-[#FAF6F3]/80 backdrop-blur-sm z-10">
//             <div className="navbar bg-transparent max-w-5xl mx-auto px-4 md:px-5">
//                  <div className="navbar-start">
//                    {/* Display current emotion indicator if available */}
//                    {currentEmotion && (
//                      <div className="flex items-center gap-2 text-sm">
//                        <div 
//                          className="w-3 h-3 rounded-full"
//                          style={{ backgroundColor: getEmotionColor(currentEmotion.dominant) }}
//                        ></div>
//                        <span className="text-gray-600 capitalize">
//                          {currentEmotion.dominant} ({Math.round(currentEmotion.confidence * 100)}%)
//                        </span>
//                      </div>
//                    )}
//                  </div>
//                  <div className="navbar-center">
//                     <h1 className={`${DMsansFont.className} text-4xl md:text-5xl text-[#6B2A7D] font-semibold`}>MindTalk</h1>
//                  </div>
//                  <div className="navbar-end">
//                     <button
//                       onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
//                       className={`btn btn-sm mr-2 ${isVoiceOutputEnabled ? 'btn-primary' : 'btn-outline'}`}
//                       disabled={isPlaying}
//                     >
//                       {isPlaying ? (
//                         <span className="loading loading-spinner loading-xs"></span>
//                       ) : (
//                         <span>{isVoiceOutputEnabled ? '🔊' : '🔇'}</span>
//                       )}
//                       {isVoiceOutputEnabled ? 'Voice ON' : 'Voice OFF'}
//                     </button>
//                     <DropDown />
//                  </div>
//             </div>
//         </header>

//         {/* Chat & Prompts Area */}
//         <div className="flex-1 flex flex-col items-center overflow-y-auto">
//           <div className="w-full max-w-5xl mx-auto px-4">
//              <div className="py-8">
//                 <ChatComponent messages={messages} />
//              </div>
//           </div>
          
//           {/* Suggested prompts appear below the chat area */}
//           <div className="w-full mt-auto">
//             <SuggestedPrompts />
//           </div>
//         </div>

//         {/* Footer */}
//         <footer className="flex-shrink-0 bg-[#FAF6F3] pt-3 pb-4 border-none">
//           <div className="max-w-4xl mx-auto px-4">
//             <div className="flex w-full items-center gap-2 md:gap-4">
//               <div className="flex-1">
//                 <ChatTextInput onSendMessage={(message) => handleSendMessage(message)} />
//               </div>
//               <ChatVoiceInput onVoiceInput={handleVoiceInput} />  {/* Updated to handle emotion */}
//             </div>
            
//             {/* Optional: Show emotion feedback below input */}
//             {currentEmotion && (
//               <div className="mt-2 flex justify-center">
//                 <div className="text-xs text-gray-500 bg-white/50 rounded-full px-3 py-1">
//                   Last emotion detected: <span className="capitalize font-medium">{currentEmotion.dominant}</span>
//                   {currentEmotion.method && <span className="ml-1">({currentEmotion.method})</span>}
//                 </div>
//               </div>
//             )}
//           </div>
//         </footer>
//       </main>
//     </div>
//   );
// }

// export default MindTalk

'use client'
import React, { useState } from 'react';
import { DropDown } from '../../components/DropDown';
import ChatComponent from '../../components/ChatBubble';
import { ChatTextInput } from '../../components/ChatTextInput';
import { ChatVoiceInput } from '../../components/ChatVoiceInput';
import SuggestedPrompts from '@/app/components/SuggestedPrompts';
import { ChatAudioResponse } from '@/app/components/ChatAudioResponse';

//font
import {DM_Sans} from "next/font/google";

const DMsansFont = DM_Sans({
  subsets: ["latin"],
})

interface Message {
  content: string;
  isUser: boolean;
  emotion?: {
    dominant: string;
    confidence: number;
  };
}

interface EmotionData {
  dominant: string;
  confidence: number;
  all_emotions?: Record<string, number>;
  method?: string;
}

const MindTalk = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  // TTS state variables
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // TTS function
  const playTextToSpeech = async (text: string) => {
    if (!isVoiceOutputEnabled || isPlaying) return;
    
    try {
      setIsPlaying(true);
      const response = await fetch('http://localhost:8000/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });
      
      if (response.ok) {
        const data = await response.json();
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio_data}`);
        audio.onended = () => setIsPlaying(false);
        await audio.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
    }
  };

  // This handler is used for both text and voice input
  const handleSendMessage = async (message: string, emotionData?: EmotionData) => {
    try {
        setIsLoading(true);
        
        // Add user message with emotion data if available
        const userMessage: Message = { 
          content: message, 
          isUser: true,
          emotion: emotionData ? {
            dominant: emotionData.dominant,
            confidence: emotionData.confidence
          } : undefined
        };
        
        setMessages(prev => [...prev, userMessage]);

        // Update current emotion state for UI display
        if (emotionData) {
          setCurrentEmotion(emotionData);
          console.log(`💭 Detected emotion: ${emotionData.dominant} (${(emotionData.confidence * 100).toFixed(1)}%)`);
        }

        const requestBody: any = {
          user_id: "user123",
          message: message
        };

        // Include emotion data in request if available
        if (emotionData) {
          requestBody.emotion_data = emotionData;
        }

        const response = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',  // Add this for session cookies
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMessages(prev => [...prev, { content: data.response, isUser: false }]);
        
        // Play AI response if voice output is enabled
        if (isVoiceOutputEnabled) {
          await playTextToSpeech(data.response);
        }
    } catch (error) {
        console.error('Error:', error);
        // Show error to user
        setMessages(prev => [...prev, { 
            content: "Sorry, I'm having trouble connecting. Please try again.", 
            isUser: false 
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  // Updated handler for voice input with emotion data
  const handleVoiceInput = (transcript: string, emotionData?: any) => {
    if (transcript) {
      handleSendMessage(transcript, emotionData);
    }
  };

  // Helper function to get emotion color for UI indication
  const getEmotionColor = (emotion?: string) => {
    if (!emotion) return '#D8A39D';
    
    const emotionColors: Record<string, string> = {
      happiness: '#4ade80', // green
      sadness: '#60a5fa',   // blue
      anger: '#f87171',     // red
      fear: '#a78bfa',      // purple
      surprise: '#fbbf24',  // yellow
      disgust: '#34d399',   // emerald
      neutral: '#9ca3af'    // gray
    };
    
    return emotionColors[emotion.toLowerCase()] || '#D8A39D';
  };

   return (
    <div className="flex h-screen bg-[#FAF6F3]">
      <main className="flex-1 flex flex-col h-screen w-full overflow-hidden">
        
        {/* Header */}
        <header className="flex-shrink-0 bg-[#FAF6F3]/80 backdrop-blur-sm z-10">
            <div className="navbar bg-transparent max-w-5xl mx-auto px-4 md:px-5">
                 <div className="navbar-start">
                   {/* Display current emotion indicator if available */}
                   {currentEmotion && (
                     <div className="flex items-center gap-2 text-sm">
                       <div 
                         className="w-3 h-3 rounded-full"
                         style={{ backgroundColor: getEmotionColor(currentEmotion.dominant) }}
                       ></div>
                       <span className="text-gray-600 capitalize">
                         {currentEmotion.dominant} ({Math.round(currentEmotion.confidence * 100)}%)
                       </span>
                     </div>
                   )}
                 </div>
                 <div className="navbar-center">
                    <h1 className={`${DMsansFont.className} text-4xl md:text-5xl text-[#6B2A7D] font-semibold`}>MitraAI</h1>
                 </div>
                 <div className="navbar-end">
                    <button
                      onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
                      className={`btn btn-sm mr-2 ${isVoiceOutputEnabled ? 'btn-primary' : 'btn-outline'}`}
                      disabled={isPlaying}
                    >
                      {isPlaying ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <span>{isVoiceOutputEnabled ? '🔊' : '🔇'}</span>
                      )}
                      {isVoiceOutputEnabled ? 'Voice ON' : 'Voice OFF'}
                    </button>
                    <DropDown />
                 </div>
            </div>
        </header>

        {/* Chat & Prompts Area */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto px-4">
             <div className="py-8">
                <ChatComponent messages={messages} />
             </div>
          </div>
          
          {/* Suggested prompts appear below the chat area */}
          <div className="w-full mt-auto">
            <SuggestedPrompts />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 bg-[#FAF6F3] pt-3 pb-4 border-none">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex w-full items-center gap-2 md:gap-4">
              <div className="flex-1">
                <ChatTextInput onSendMessage={(message) => handleSendMessage(message)} />
              </div>
              <ChatVoiceInput onVoiceInput={handleVoiceInput} />  {/* Updated to handle emotion */}
            </div>
            
            {/* Optional: Show emotion feedback below input */}
            {currentEmotion && (
              <div className="mt-2 flex justify-center">
                <div className="text-xs text-gray-500 bg-white/50 rounded-full px-3 py-1">
                  Last emotion detected: <span className="capitalize font-medium">{currentEmotion.dominant}</span>
                  {currentEmotion.method && <span className="ml-1">({currentEmotion.method})</span>}
                </div>
              </div>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}

export default MindTalk

/*after emotion integration*/