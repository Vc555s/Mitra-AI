// filepath: /home/vishalj/frontend/app/components/ChatAudioResponse.tsx
import { useRef } from 'react';

interface ChatAudioResponseProps {
    text: string;
}

export function ChatAudioResponse({ text }: ChatAudioResponseProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    const playResponse = async () => {
        try {
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                if (audioRef.current) {
                    audioRef.current.src = url;
                    await audioRef.current.play();
                }
            }
        } catch (error) {
            console.error('TTS playback error:', error);
        }
    };

    return (
        <div>
            <button onClick={playResponse}>
                🔊 Play Response
            </button>
            <audio ref={audioRef} />
        </div>
    );
}