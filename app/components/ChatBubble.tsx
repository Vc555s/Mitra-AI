import React from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

interface ChatComponentProps {
  messages: Array<{
    content: string;
    isUser: boolean;
  }>;
}

const ChatComponent = ({ messages }: ChatComponentProps) => {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`chat ${msg.isUser ? "justify-end" : "justify-start"}`}
        >
          {!msg.isUser && (
            <div className="flex items-center gap-3">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <Image
                    src="/LandingPageLogo.svg"
                    alt="MindTalk Logo"
                    width={40}
                    height={40}
                  />
                </div>
              </div>
              <div
                className={`chat-bubble rounded-lg inline-block max-w-[75%] px-4 py-2 bg-transparent text-[#403635]`}
                style={{ wordBreak: "break-word" }}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          )}
          {msg.isUser && (
            <div className="flex items-center justify-end gap-3">
              <div
                className={`chat-bubble rounded-lg shadow-sm shadow-[#A882A0]/60 inline-block max-w-[75%] px-4 py-2 bg-[#F6D8D6]/20 text-[#403635]`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatComponent;
