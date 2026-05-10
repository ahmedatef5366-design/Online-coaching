"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Tag-equivalent: pass "li" or "article" if you need semantic markup */
  as?: "div" | "li" | "article" | "section" | "ol" | "ul";
}

const TAGS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  section: motion.section,
  ol: motion.ol,
  ul: motion.ul,
} as const;

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const Tag = TAGS[as];
  if (prefersReduced) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }
  return (
    <Tag
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </Tag>
  );
}
