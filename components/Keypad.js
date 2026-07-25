export default function Keypad({ onDigit, onEnter, onBackspace, dark, disabled }) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  const keyClasses = dark
    ? "bg-neutral-800 text-white active:bg-neutral-700"
    : "bg-neutral-100 text-black active:bg-neutral-200";

  const enterClasses = dark
    ? "bg-neutral-100 text-neutral-900 active:bg-white"
    : "bg-black text-white active:bg-neutral-800";

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="grid grid-cols-5 gap-2">
        {digits.map((d) => (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onDigit(d)}
            className={`w-12 h-12 text-lg font-semibold ${keyClasses} disabled:opacity-40`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex gap-2 w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          className={`flex-1 h-12 text-lg font-semibold ${keyClasses} disabled:opacity-40`}
        >
          ⌫
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className={`flex-1 h-12 text-lg font-semibold ${enterClasses} disabled:opacity-40`}
        >
          Enter
        </button>
      </div>
    </div>
  );
}