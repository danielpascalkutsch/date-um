"use client";

import { useState, useEffect, useRef } from "react";
import { compareGuess } from "../lib/compareGuess";
import Board from "../components/Board";
import Keypad from "../components/Keypad";
import Countdown from "../components/Countdown";
import { getTodaysPuzzle, getMillisUntilNextPuzzle, getPuzzleNumber } from "../lib/getTodaysPuzzle";
import { buildShareText } from "../lib/buildShareText";

export default function Home() {
  // Puzzle is loaded AFTER mount only — never computed during server render,
  // so there's nothing for the server and client to disagree about.
  const [puzzle, setPuzzle] = useState<any>(null);
  const puzzleNumber = puzzle ? getPuzzleNumber() : null;
  const storageKey = puzzle ? `date-um-progress-${puzzleNumber}` : null;

  const answer = puzzle ? { month: puzzle.month, year: puzzle.year } : { month: 1, year: 2000 };
  const clue = puzzle ? puzzle.clue : "";
  const description = puzzle ? puzzle.description : "";

  // guesses starts empty for BOTH server and client — no localStorage read during render.
  const [guesses, setGuesses] = useState<any[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [showHelp, setShowHelp] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  // hasLoadedGuesses is a REF, not state — it updates immediately/synchronously,
  // so there's no race where "save" can fire before "load" has finished.
  const hasLoadedGuesses = useRef(false);

  const maxGuesses = 5;
  const gameWon = guesses.some(
    (g) => g.monthGroup.type === "exact" && g.yearGroups.every((y: any) => y.type === "exact")
  );
  const gameOver = gameWon || guesses.length >= maxGuesses;
  const activeRowIndex = gameOver ? -1 : guesses.length;

  function appendDigit(digit: string) {
    if (gameOver) return;
    setError("");
    setCurrentInput((prev) => (prev.length < 6 ? prev + digit : prev));
  }

  function backspace() {
    if (gameOver) return;
    setError("");
    setCurrentInput((prev) => prev.slice(0, -1));
  }

  function submitGuess() {
    if (gameOver || !puzzle) return;

    if (currentInput.length !== 6) {
      setError("Enter a full MM YYYY date");
      return;
    }

    const monthNum = parseInt(currentInput.slice(0, 2), 10);
    const yearNum = parseInt(currentInput.slice(2), 10);

    if (!monthNum || monthNum < 1 || monthNum > 12) {
      setError("Enter a valid month (01-12)");
      return;
    }

    setError("");
    const result = compareGuess({ month: monthNum, year: yearNum }, answer);
    setGuesses((prev) => [...prev, result]);
    setCurrentInput("");
  }

  async function handleShare() {
    const text = buildShareText(guesses, gameWon, puzzleNumber, clue);

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setShareStatus("Copied to clipboard!");
        setTimeout(() => setShareStatus(""), 2000);
      } catch (err) {
        setShareStatus("Couldn't copy — try manually.");
      }
    }
  }

  // Load today's puzzle — browser only, runs once after mount.
  useEffect(() => {
    setPuzzle(getTodaysPuzzle());
  }, []);

  // Once the puzzle (and therefore storageKey) is ready, load any saved guesses for it.
  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setGuesses(JSON.parse(saved));
    }
    hasLoadedGuesses.current = true;
  }, [storageKey]);

  // Save guesses — but ONLY after the load effect above has already run,
  // so we never overwrite real saved progress with an empty starting array.
  useEffect(() => {
    if (!storageKey) return;
    if (!hasLoadedGuesses.current) return;
    localStorage.setItem(storageKey, JSON.stringify(guesses));
  }, [guesses, storageKey]);

  // Physical keyboard support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (gameOver) return;
      if (/^[0-9]$/.test(e.key)) {
        appendDigit(e.key);
      } else if (e.key === "Enter") {
        submitGuess();
      } else if (e.key === "Backspace") {
        backspace();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    if (gameOver) {
      setShowShareModal(true);
    }
  }, [gameOver]);

  // Don't render the real page until the puzzle has loaded client-side.
  if (!puzzle) return null;

  return (
    <main
      className={`relative flex flex-col items-center justify-center min-h-screen gap-6 p-4 transition-colors ${
        dark ? "bg-neutral-900 text-neutral-100" : "bg-white text-neutral-900"
      }`}
    >
      <div className="w-full max-w-md flex justify-between items-center">
        <h1 className="text-3xl font-bold">date-um???</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelp(true)}
            aria-label="How to play"
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold flex-shrink-0 ${
              dark ? "border-neutral-400 text-neutral-100" : "border-neutral-400 text-neutral-900"
            }`}
          >
            ?
          </button>
          <button
            onClick={() => setDark(!dark)}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-neutral-400 flex-shrink-0"
          >
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <path d="M0 32 L32 32 L32 0 Z" fill="#171717" />
              <path d="M0 32 L0 0 L32 0 Z" fill="#f5f5f5" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`max-w-md text-center px-5 py-4 text-lg font-medium ${
          dark ? "bg-neutral-800 text-neutral-100" : "bg-neutral-100 text-neutral-900"
        }`}
      >
        {clue}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {gameWon && <p className="font-semibold text-emerald-500">You got it!</p>}
      {!gameWon && gameOver && <p className="font-semibold">Out of guesses!</p>}

      <Board guesses={guesses} activeRowIndex={activeRowIndex} activeInput={currentInput} dark={dark} />

      {!gameOver && (
        <Keypad onDigit={appendDigit} onEnter={submitGuess} onBackspace={backspace} dark={dark} disabled={gameOver} />
      )}

      {gameOver && (
        <div
          className={`max-w-md text-center px-5 py-4 text-base leading-relaxed ${
            dark ? "bg-neutral-800 text-neutral-100" : "bg-neutral-100 text-neutral-900"
          }`}
        >
          {description}
        </div>
      )}

      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleShare}
            className={`px-5 py-2 font-semibold ${
              dark ? "bg-neutral-100 text-neutral-900" : "bg-black text-white"
            }`}
          >
            Share Results
          </button>
          {shareStatus && (
            <p className={`text-sm ${dark ? "text-neutral-300" : "text-neutral-600"}`}>{shareStatus}</p>
          )}
        </div>
      )}

      {gameOver && <Countdown dark={dark} />}

      {showHelp && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowHelp(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`max-w-md w-full p-6 leading-relaxed ${
              dark ? "bg-neutral-800 text-neutral-100" : "bg-white text-neutral-900"
            }`}
          >
            <h2 className="text-xl font-bold mb-3">How to Play</h2>
            <p className="mb-3">Guess the month and year of the clue. You get 5 tries.</p>
            <p className="mb-3">
              🟩 = correct. A top line means guess higher and a bottom line means guess lower.
            </p>
            <p className="mb-3">Month - one whole number, not digit by digit.</p>
            <p className="mb-3">Year - if one digit is wrong, every digit after is considered wrong too.</p>

            <div className="mb-3">
              <p className="text-sm mb-2 font-medium">Example: answer is 03 1982</p>
              <div className="flex gap-3">
                <div className="relative flex gap-1">
                  <div className="w-8 h-10 flex items-center justify-center text-sm font-bold bg-neutral-200">0</div>
                  <div className="w-8 h-10 flex items-center justify-center text-sm font-bold bg-neutral-200">5</div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-400" />
                </div>
                <div className="flex gap-1">
                  <div className="w-8 h-10 flex items-center justify-center text-sm font-bold bg-emerald-600 text-white">1</div>
                  <div className="w-8 h-10 flex items-center justify-center text-sm font-bold bg-emerald-600 text-white">9</div>
                  <div className="relative flex gap-1">
                    <div className="w-8 h-10 flex items-center justify-center text-sm font-bold bg-neutral-200">6</div>
                    <div className="w-8 h-10 flex items-center justify-center text-sm font-bold bg-neutral-200">2</div>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-sky-400" />
                  </div>
                </div>
              </div>
              <p className="text-xs mt-2 text-neutral-500">
                Guessed 05 1962 — month 05 is too late (line on bottom), year: 1 and 9 are right, but 6 was wrong, so 62 is grouped and marked too low (line on top).
              </p>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className={`mt-4 px-4 py-2 font-semibold ${
                dark ? "bg-neutral-100 text-neutral-900" : "bg-black text-white"
              }`}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowShareModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`max-w-md w-full p-6 text-center ${
              dark ? "bg-neutral-800 text-neutral-100" : "bg-white text-neutral-900"
            }`}
          >
            <h2 className="text-xl font-bold mb-3">
              {gameWon ? "You got it!" : "Nice try!"}
            </h2>
            <p className="mb-4">Share your results with friends.</p>
            <button
              onClick={handleShare}
              className={`px-5 py-2 font-semibold ${
                dark ? "bg-neutral-100 text-neutral-900" : "bg-black text-white"
              }`}
            >
              Share Results
            </button>
            <button
              onClick={() => setShowShareModal(false)}
              className={`block mx-auto mt-4 text-sm underline ${
                dark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}