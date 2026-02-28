"use client";

import { forwardRef } from "react";

interface NameInputProps {
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

const NameInput = forwardRef<HTMLInputElement, NameInputProps>(
  ({ onSubmit, isLoading }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = form.elements.namedItem("name") as HTMLInputElement;
      const value = input.value.trim();
      if (value) onSubmit(value);
    };

    return (
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <input
          ref={ref}
          name="name"
          type="text"
          placeholder="Enter your name"
          maxLength={20}
          autoComplete="off"
          disabled={isLoading}
          className="w-full px-4 py-3 text-base rounded-none border-b-2 transition-colors
                     disabled:opacity-40"
          style={{
            background: "transparent",
            color: "#EEEEEE",
            borderColor: "#333",
            fontFamily: "'Space Grotesk', sans-serif",
            outline: "none",
            letterSpacing: "0.05em",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#FD551D")}
          onBlur={(e) => (e.target.style.borderColor = "#333")}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 text-sm font-semibold uppercase tracking-[0.15em] rounded-none
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
          style={{
            background: "#FD551D",
            color: "#141314",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {isLoading ? "Generating..." : "Get Your Kanji"}
        </button>
      </form>
    );
  }
);

NameInput.displayName = "NameInput";

export default NameInput;
