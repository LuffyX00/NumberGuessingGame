export default function GuessHistory({ history, myName }) {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
        Guess History
      </p>
      <div
        className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1
                   [&::-webkit-scrollbar]:w-1
                   [&::-webkit-scrollbar-thumb]:bg-zinc-700
                   [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {[...history].reverse().map((g, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs
              ${g.player === myName
                ? "bg-violet-900/30 border border-violet-700/40"
                : "bg-zinc-800"}`}
          >
            {/* Left — player + guess */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
                {g.player[0].toUpperCase()}
              </div>
              <span className="font-bold text-zinc-200">
                {g.player}{g.player === myName ? " (You)" : ""}
              </span>
              <span className="text-zinc-500">guessed</span>
              <span className="font-mono font-bold text-cyan-400">{g.guess}</span>
            </div>

            {/* Right — result badge */}
            {/* {g.result ? (
              <span className={`font-bold text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                g.result.includes("low")     ? "bg-blue-500/20 text-blue-400"     :
                g.result.includes("high")    ? "bg-orange-500/20 text-orange-400" :
                g.result.includes("Correct") ? "bg-emerald-500/20 text-emerald-400" :
                "bg-zinc-700 text-zinc-400"
              }`}>
                {g.result}
              </span>
            ) : (
              <span className="text-zinc-600 text-[11px] italic">pending…</span>
            )} */}
          </div>
        ))}
      </div>
    </div>
  );
}