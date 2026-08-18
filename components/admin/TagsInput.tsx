"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagsInput({ value, onChange, placeholder = "Add tags..." }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue) {
      const currentTags = value || [];
      if (currentTags.length > 0) {
        e.preventDefault();
        removeTag(currentTags.length - 1);
      }
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().toLowerCase();
    const currentTags = value || [];
    if (trimmed && !currentTags.includes(trimmed)) {
      onChange([...currentTags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    const currentTags = value || [];
    onChange(currentTags.filter((_, index) => index !== indexToRemove));
  };

  const safeValue = value || [];

  return (
    <div className="flex flex-wrap gap-2 p-2 border border-slate-700 bg-[#0d1117] rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
      {safeValue.map((tag, index) => (
        <span
          key={index}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="text-blue-400 hover:text-red-400 hover:bg-red-500/20 p-0.5 rounded-sm transition-colors"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-500 min-w-[120px]"
        placeholder={safeValue.length === 0 ? placeholder : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
      />
    </div>
  );
}
