"use client";

import React, { useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface TextWriterProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

const TextWriter: React.FC<TextWriterProps> = ({ placeholder, onChange }) => {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || "Start typing...",
    }),
    [placeholder]
  );

  const handleBlur = (newContent: string) => {
    setContent(newContent);
    onChange?.(newContent);
  };

  return (
    <JoditEditor
      ref={editor}
      value={content}
      config={config}
      tabIndex={1}
      onBlur={handleBlur}
      onChange={() => {}}
    />
  );
};

export default TextWriter;
