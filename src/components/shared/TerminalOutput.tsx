import { useEffect, useRef } from 'react';

interface TerminalOutputProps {
  output: string;
  className?: string;
}

export default function TerminalOutput({ output, className = '' }: TerminalOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div
      ref={containerRef}
      className={`bg-gray-950 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-auto whitespace-pre-wrap leading-relaxed ${className}`}
    >
      {output || <span className="text-gray-600">Waiting for output...</span>}
    </div>
  );
}
