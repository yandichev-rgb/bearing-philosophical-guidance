import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Restrained reveal on scroll: a short lift and fade with mechanical easing.
 * Reduced motion renders the content plainly.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const still = useReducedMotion();
  const Tag = motion[as];

  if (still) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.62, delay, ease: [0.16, 0.68, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
