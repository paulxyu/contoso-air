"use client";
import React from "react";

interface ChatButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean; // reserved if we later want to support Slot patterns
}

const ChatButton: React.FC<ChatButton> = ({ children, onClick, ...rest }) => {
  return (
    <button
      type="button"
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        window.dispatchEvent(new Event("contoso-chat-open"));
      }}
    >
      {children}
    </button>
  );
};

export default ChatButton;
