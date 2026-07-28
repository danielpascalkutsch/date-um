export function buildShareText(guesses, gameWon, puzzleNumber) {
  const rows = guesses.map((result) => {
    const monthEmoji = groupToEmoji(result.monthGroup.type, result.monthGroup.chars.length);
    const yearEmoji = result.yearGroups
      .map((g) => groupToEmoji(g.type, g.chars.length))
      .join("");
    return monthEmoji + " " + yearEmoji;
  });

  const score = gameWon ? `${guesses.length}/5` : "X/5";

  return `date-um??? #${puzzleNumber} ${score}\n\n${rows.join("\n")}\n\nplay at date-um.vercel.app`;
}

function groupToEmoji(type, length) {
  if (type === "exact") return "🟩".repeat(length);
  if (type === "low") return "⬆️".repeat(length);
  if (type === "high") return "⬇️".repeat(length);
  return "⬜".repeat(length);
}