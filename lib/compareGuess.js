// lib/compareGuess.js

export function compareGuess(guess, answer) {
  // --- Month: one unit, 2 digits, always same color/line together ---
  const monthChars = String(guess.month).padStart(2, "0").split("");
  let monthType;
  if (guess.month === answer.month) monthType = "exact";
  else if (guess.month < answer.month) monthType = "low";
  else monthType = "high";

  const monthGroup = { chars: monthChars, type: monthType };

  // --- Year: cascading left to right ---
  const guessDigits = String(guess.year).padStart(4, "0").split("");
  const answerDigits = String(answer.year).padStart(4, "0").split("");

  const yearGroups = [];
  let i = 0;

  while (i < 4) {
    if (guessDigits[i] === answerDigits[i]) {
      yearGroups.push({ chars: [guessDigits[i]], type: "exact" });
      i++;
    } else {
      const remainingGuess = guessDigits.slice(i).join("");
      const remainingAnswer = answerDigits.slice(i).join("");
      const type = parseInt(remainingGuess, 10) < parseInt(remainingAnswer, 10) ? "low" : "high";

      yearGroups.push({ chars: guessDigits.slice(i), type });
      break;
    }
  }

  return { monthGroup, yearGroups };
}