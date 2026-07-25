"use client";

import { useState, useEffect } from "react";
import { getMillisUntilNextPuzzle } from "../lib/getTodaysPuzzle";

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function Countdown({ dark }) {
  const [remaining, setRemaining] = useState(getMillisUntilNextPuzzle());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getMillisUntilNextPuzzle());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`text-sm font-medium ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
      Next puzzle in {formatTime(remaining)}
    </div>
  );
}