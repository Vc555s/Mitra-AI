import React from "react";

const SuggestedPrompts = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 md:gap-6 py-8">
      <p className="text-[#403635] text-base md:text-lg font-medium">
        Try starting with one of these
      </p>
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {[
          'I’ve been feeling anxious lately',
          'I’m having trouble sleeping',
          'I’ve been feeling overwhelmed',
          'I want to talk about my stress',
        ].map((prompt, idx) => (
          <button
            key={idx}
            className="cursor-pointer text-[#403635] border border-[#D8A39D] rounded-full px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-medium text-center hover:bg-[#D8A39D]/50 transition-colors duration-200"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;
