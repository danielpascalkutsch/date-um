"use client";

import { useState, useEffect } from "react";
import { compareGuess } from "../lib/compareGuess";
import Board from "../components/Board";
import Keypad from "../components/Keypad";
import { getTodaysPuzzle } from "../lib/getTodaysPuzzle";
import Countdown from "../components/Countdown";

export default function Home() {
  const puzzle = getTodaysPuzzle();
  const answer = { month: puzzle.month, year: puzzle.year };
  const clue = puzzle.clue;
  const description = puzzle.description;

  const [guesses, setGuesses] = useState<any[]>([]);
  const [currentInput, setCurrentInput] = useState(""); // up to 6 digits: MM + YYYY
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
    if (gameOver) return;

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

  // Listen for physical keyboard input directly, since there's no visible input field anymore
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
            <p className="mb-2">
              Guess the month and year (MM YYYY) that answers the clue. You have 5 tries.
            </p>
            <p className="mb-2">
              The <strong>month</strong> is always checked as one number: green means correct,
              a line on top means your guess is too early, a line on the bottom means too late.
            </p>
            <p className="mb-2">
              The <strong>year</strong> is checked left to right, one digit at a time. As soon as
              a digit is wrong, that digit and everything after it are grouped together and
              checked as one number — even if a later digit would have matched on its own.
            </p>
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
    </main>
  );
}