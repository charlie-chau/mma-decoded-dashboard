"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export default function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  const updatePos = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, []);

  useEffect(() => {
    if (show) updatePos();
  }, [show, updatePos]);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex ml-1 cursor-help"
      onMouseEnter={() => {
        if (timeout.current) clearTimeout(timeout.current);
        setShow(true);
      }}
      onMouseLeave={() => {
        timeout.current = setTimeout(() => setShow(false), 150);
      }}
    >
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-[var(--muted)] text-[var(--muted)] text-[9px] leading-none font-medium">
        ?
      </span>
      {show &&
        pos &&
        createPortal(
          <span
            className="fixed z-[9999] px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[var(--border)] text-xs text-[var(--fg)] leading-relaxed w-64 shadow-lg pointer-events-none"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}
