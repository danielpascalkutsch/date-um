import { puzzles } from "./puzzles";

// A fixed reference date — day 0 of the rotation. Puzzle index increases by 1 each day after this.
const START_DATE = new Date("2026-07-27T00:00:00-07:00"); // midnight Pacific on launch day

export function getTodaysPuzzle() {
  // Get "now" in Pacific time, then zero out to midnight for clean day-counting
  const now = new Date();
  const pacificNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));

  const daysSinceStart = Math.floor((pacificNow - START_DATE) / (1000 * 60 * 60 * 24));
  const index = ((daysSinceStart % puzzles.length) + puzzles.length) % puzzles.length; // safe for negative too

  return puzzles[index];
}

export function getMillisUntilNextPuzzle() {
  const now = new Date();
  const pacificNowStr = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  const pacificNow = new Date(pacificNowStr);

  const nextMidnight = new Date(pacificNow);
  nextMidnight.setHours(24, 0, 0, 0); // rolls to next day's midnight

  return nextMidnight - pacificNow;
}

export function getPuzzleNumber() {
  const now = new Date();
  const pacificNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const daysSinceStart = Math.floor((pacificNow - START_DATE) / (1000 * 60 * 60 * 24));
  return daysSinceStart + 1; // so day 0 shows as "Puzzle #1"
}