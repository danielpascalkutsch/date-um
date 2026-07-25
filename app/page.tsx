"use client";

import { useState, useEffect } from "react";
import { compareGuess } from "../lib/compareGuess";
import Board from "../components/Board";
import Keypad from "../components/Keypad";

export default function Home() {
  const answer = { month: 2, year: 1970 };
  const clue = 'When did The Jackson 5 release their hit song "ABC"?';
  const description =
    '"ABC" is a song by American pop band the Jackson 5. It was released as a single on February 24, 1970, peaking at number one on the Billboard Hot 100 singles chart for two weeks in April 1970, and was number one on the Best Selling Soul Singles chart for four weeks that same month. It is the title track to the group\'s second album and sold 2 million copies within the first week of its release in the US and more than 4 million copies worldwide.';

  const [guesses, setGuesses] = useState<any[]>([]);
  const [currentInput, setCurrentInput] = useState(""); // up to 6 digits: MM + YYYY
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);

  const maxGuesses = 5;
  const gameWon = guesses.some(
    (g) => g.monthGroup.type === "exact" && g.yearGroups.every((y) => y.type === "exact")
  );
  const gameOver = gameWon || guesses.length >= maxGuesses;
  const activeRowIndex = gameOver ? -1 : guesses.length;

  function appendDigit(digit) {
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
    function handleKeyDown(e) {
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
        <button
          onClick={() => setDark(!dark)}
          className={`px-3 py-1 text-sm font-semibold ${
            dark ? "bg-neutral-700 text-white" : "bg-neutral-200 text-neutral-800"
          }`}
        >
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
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
    </main>
  );
}