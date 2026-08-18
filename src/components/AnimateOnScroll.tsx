"use client";

import { useEffect, useRef, ReactNode } from "react";

type AnimationType = "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scaleUp" | "rotateIn";

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

export default function AnimateOnScroll({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 700,
  className = "",
  threshold = 0.15,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.style.transitionDuration = `${duration}ms`;
          el.classList.add("animate-visible");
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, duration, threshold]);

  return (
    <div ref={ref} className={`animate-hidden animate-${animation} ${className}`}>
      {children}
    </div>
  );
}
