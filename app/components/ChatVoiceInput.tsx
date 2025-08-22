// import { Button } from "@/components/ui/button";
// import MicIcon from '@mui/icons-material/Mic';
// import { useEffect, useState } from "react";
// import React, { useRef } from 'react';

// interface ChatVoiceInputProps {
//   onVoiceInput?: (text: string) => void;
//   disabled?: boolean;
// }

// export function ChatVoiceInput({ onVoiceInput, disabled }: ChatVoiceInputProps) {
//   const [isRecording, setIsRecording] = useState(false);
//   const mediaRecorder = useRef<MediaRecorder | null>(null);
//   const audioChunks = useRef<Blob[]>([]);

//   useEffect(() => {
//     const initRecorder = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         mediaRecorder.current = new MediaRecorder(stream);

//         mediaRecorder.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunks.current.push(event.data);
//           }
//         };

//         mediaRecorder.current.onstop = async () => {
//           const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
//           const formData = new FormData();
//           formData.append('audio', audioBlob);

//           try {
//             const response = await fetch('http://localhost:8000/api/speech-to-text', {
//               method: 'POST',
//               body: formData,
//             });

//             const data = await response.json();
//             if (data.text && onVoiceInput) {
//               onVoiceInput(data.text);

//               // Display emotion if available
//               if (data.emotion) {
//                 console.log(
//                   `🎤 Speech emotion: ${data.emotion.dominant} (${data.emotion.confidence.toFixed(2)})`
//                 );
//                 // You can add UI to display this emotion
//               }
//             }
//           } catch (error) {
//             console.error('Error converting speech to text:', error);
//           }
//         };
//       } catch (error) {
//         console.error('Error initializing recorder:', error);
//       }
//     };

//     initRecorder();

//     return () => {
//       mediaRecorder.current?.stream.getTracks().forEach((track) => track.stop());
//     };
//   }, [onVoiceInput]);

//   const handleRecord = () => {
//     setIsRecording(true);
//     audioChunks.current = [];
//     mediaRecorder.current?.start();
//   };

//   const handleStop = () => {
//     setIsRecording(false);
//     mediaRecorder.current?.stop();
//   };

//   return (
//     <Button
//       onClick={isRecording ? handleStop : handleRecord}
//       className="rounded-full w-14 h-14 bg-[#F6D8D6] hover:bg-[#D8A39D]/50 shadow-md transition-colors"
//       variant="ghost"
//       size="icon"
//       disabled={disabled}
//     >
//       <MicIcon style={{ color: '#D8A39D' }} />
//     </Button>
//   );
// }



// components/ChatVoiceInput.tsx
import { Button } from "@/components/ui/button";
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { useEffect, useState, useRef } from "react";
import React from 'react';

interface ChatVoiceInputProps {
  onVoiceInput?: (text: string, emotion?: any) => void;
  disabled?: boolean;
}

export function ChatVoiceInput({ onVoiceInput, disabled }: ChatVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize media recorder
  const initializeRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      // Check for supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/wav';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/mp4';
          }
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        await processRecording();
        setIsProcessing(false);
      };

    } catch (error) {
      console.error('Error initializing recorder:', error);
      alert('Microphone access denied or not available');
    }
  };

  const processRecording = async () => {
    try {
      if (audioChunksRef.current.length === 0) {
        console.warn('No audio data recorded');
        return;
      }

      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      });

      // Convert to WAV if needed (for better compatibility with backend)
      const wavBlob = await convertToWav(audioBlob);
      
      const formData = new FormData();
      formData.append('audio', wavBlob, 'recording.wav');

      // Send to backend
      const response = await fetch('http://localhost:8000/api/speech-to-text', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Backend error:', data.error);
        return;
      }

      if (data.text && onVoiceInput) {
        // Pass both text and emotion data to parent
        onVoiceInput(data.text, data.emotion);
        
        // Log emotion for debugging
        if (data.emotion) {
          console.log(`🎤 Speech emotion: ${data.emotion.dominant} (${(data.emotion.confidence * 100).toFixed(1)}%)`);
        }
      } else {
        console.warn('No text transcribed from audio');
      }

    } catch (error) {
      console.error('Error processing recording:', error);
      alert('Error processing voice input. Please try again.');
    }
  };

  // Convert audio to WAV format for better backend compatibility
  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Convert to WAV
      const wavBuffer = audioBufferToWav(audioBuffer);
      return new Blob([wavBuffer], { type: 'audio/wav' });
    } catch (error) {
      console.warn('Could not convert to WAV, using original format:', error);
      return audioBlob;
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert float32 to int16
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  };

  const startRecording = async () => {
    if (!mediaRecorderRef.current) {
      await initializeRecorder();
    }

    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'recording') {
      return;
    }

    try {
      audioChunksRef.current = [];
      setRecordingTime(0);
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) { // Auto-stop after 30 seconds
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      mediaRecorderRef.current.start(100); // Collect data every 100ms
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
    setRecordingTime(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getButtonColor = () => {
    if (isRecording) return '#ff4444'; // Red when recording
    if (isProcessing) return '#ffa500'; // Orange when processing
    return '#D8A39D'; // Default color
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (isRecording) return `Recording... ${recordingTime}s`;
    return 'Click to record';
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={handleButtonClick}
        className="rounded-full w-14 h-14 bg-[#F6D8D6] hover:bg-[#D8A39D]/50 shadow-md transition-all duration-200"
        variant="ghost"
        size="icon"
        disabled={disabled || isProcessing}
        title={getButtonText()}
      >
        {isRecording ? (
          <StopIcon style={{ color: getButtonColor() }} />
        ) : (
          <MicIcon style={{ color: getButtonColor() }} />
        )}
      </Button>
      
      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-2 text-xs text-red-500 font-medium">
          Recording... {recordingTime}s
        </div>
      )}
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className="mt-2 text-xs text-orange-500 font-medium">
          Processing...
        </div>
      )}
    </div>
  );
}