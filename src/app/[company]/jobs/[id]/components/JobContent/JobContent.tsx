"use client";

interface JobContentProps {
  content: string;
}

export function JobContent({ content }: JobContentProps) {
  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}