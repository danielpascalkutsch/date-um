function getBoxClasses(type, dark, empty, active) {
  if (type === "exact") {
    return dark ? "bg-emerald-500 text-white" : "bg-emerald-600 text-white";
  }
  if (type === "low" || type === "high") {
    return dark ? "bg-neutral-700 text-neutral-100" : "bg-neutral-200 text-neutral-800";
  }
  if (active) {
    // currently-typing row: neutral but slightly distinct so it reads as "live"
    return dark ? "bg-neutral-700 text-white" : "bg-neutral-200 text-black";
  }
  if (empty) {
    return dark ? "bg-neutral-800" : "bg-neutral-100";
  }
  return dark ? "bg-neutral-800" : "bg-neutral-100";
}

function BoxGroup({ chars, type, dark, boxSize, active }) {
  return (
    <div className="relative flex gap-1">
      {chars.map((char, idx) => (
        <div
          key={idx}
          className={`${boxSize} flex items-center justify-center text-3xl font-bold ${getBoxClasses(type, dark, char === "", active)}`}
        >
          {char}
        </div>
      ))}

      {type === "low" && (
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${dark ? "bg-sky-300" : "bg-sky-400"}`} />
      )}
      {type === "high" && (
        <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${dark ? "bg-rose-300" : "bg-rose-400"}`} />
      )}
    </div>
  );
}

function BoardRow({ result, dark, boxSize, active, activeInput }) {
  // Case 1: submitted guess -> use compareGuess groups, fully colored
  if (result) {
    return (
      <div className="flex gap-3">
        <BoxGroup chars={result.monthGroup.chars} type={result.monthGroup.type} dark={dark} boxSize={boxSize} />
        <div className="flex gap-1">
          {result.yearGroups.map((group, idx) => (
            <BoxGroup key={idx} chars={group.chars} type={group.type} dark={dark} boxSize={boxSize} />
          ))}
        </div>
      </div>
    );
  }

  // Case 2: this is the active row being typed into right now
  if (active) {
    const monthChars = [activeInput[0] || "", activeInput[1] || ""];
    const yearChars = [
      activeInput[2] || "",
      activeInput[3] || "",
      activeInput[4] || "",
      activeInput[5] || "",
    ];
    return (
      <div className="flex gap-3">
        <BoxGroup chars={monthChars} type={null} dark={dark} boxSize={boxSize} active />
        <div className="flex gap-1">
          <BoxGroup chars={yearChars} type={null} dark={dark} boxSize={boxSize} active />
        </div>
      </div>
    );
  }

  // Case 3: future, not-yet-reached row -> fully blank
  return (
    <div className="flex gap-3">
      <BoxGroup chars={["", ""]} type={null} dark={dark} boxSize={boxSize} />
      <div className="flex gap-1">
        <BoxGroup chars={["", "", "", ""]} type={null} dark={dark} boxSize={boxSize} />
      </div>
    </div>
  );
}

export default function Board({ guesses, activeRowIndex, activeInput, dark }) {
  const boxSize = "w-14 h-16";
  const totalRows = 5;

  return (
    <div className="flex flex-col gap-2 items-center">
      {new Array(totalRows).fill(null).map((_, idx) => (
        <BoardRow
          key={idx}
          result={guesses[idx] || null}
          active={idx === activeRowIndex}
          activeInput={activeInput}
          dark={dark}
          boxSize={boxSize}
        />
      ))}
    </div>
  );
}