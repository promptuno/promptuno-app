import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

import { cn } from "../lib/utils";

interface TypewriterProps {
  text: string | string[];
  speed?: number;
  initialDelay?: number;
  delay?: number;
  waitTime?: number;
  deleteSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorOnType?: boolean;
  cursorChar?: string | React.ReactNode;
  cursorClassName?: string;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 18,
  initialDelay,
  delay = 0,
  waitTime = 2000,
  deleteSpeed = 30,
  loop = true,
  className,
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = "|",
  cursorClassName = "ml-1",
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const texts = Array.isArray(text) ? text : [text];
  const effectiveInitialDelay = initialDelay ?? delay;

  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
    setIsDeleting(false);
    setCurrentTextIndex(0);
  }, [text]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const currentText = texts[currentTextIndex] ?? "";

    const markComplete = () => {
      if (!loop && currentTextIndex === texts.length - 1 && currentIndex >= currentText.length) {
        onComplete?.();
      }
    };

    const startTyping = () => {
      if (isDeleting) {
        if (displayText === "") {
          setIsDeleting(false);

          if (currentTextIndex === texts.length - 1 && !loop) {
            markComplete();
            return;
          }

          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          setCurrentIndex(0);
          return;
        }

        timeout = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
          setCurrentIndex((prev) => Math.max(0, prev - 1));
        }, deleteSpeed);
        return;
      }

      if (currentIndex < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText((prev) => prev + currentText[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, speed);
        return;
      }

      markComplete();

      if (texts.length > 1 && loop) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, waitTime);
      }
    };

    if (currentIndex === 0 && !isDeleting && displayText === "") {
      timeout = setTimeout(startTyping, effectiveInitialDelay);
    } else {
      startTyping();
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [
    currentIndex,
    currentTextIndex,
    deleteSpeed,
    displayText,
    effectiveInitialDelay,
    isDeleting,
    loop,
    onComplete,
    speed,
    texts,
    waitTime,
  ]);

  const currentText = texts[currentTextIndex] ?? "";
  const shouldHideCursor =
    hideCursorOnType && (currentIndex < currentText.length || isDeleting);

  return (
    <div className={cn("inline whitespace-pre-wrap tracking-tight", className)}>
      <span>{displayText}</span>
      {showCursor && !shouldHideCursor && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: 0.01,
              repeat: Infinity,
              repeatDelay: 0.4,
              repeatType: "reverse",
            },
          }}
          className={cn(cursorClassName)}
        >
          {cursorChar}
        </motion.span>
      )}
    </div>
  );
};
