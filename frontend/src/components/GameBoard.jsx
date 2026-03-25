import { useEffect } from "react";
import GuessHistory from "./GuessHistory";

export default function GameBoard({
  players, myId, myIdRef, myName, currentTurn, isMyTurn,
  target, setTarget, guess, setGuess,
  sendGuess, guessHistory, room,
}) {
  // ✅ Use myIdRef.current so opponent is never stale
  const opponent = Object.entries(players).find(([id]) => id !== myIdRef.current);

  // ✅ Watches target too — refills automatically after restart clears it
  useEffect(() => {
    if (opponent && !target) {
      setTarget(opponent[0]);
    }
  }, [opponent?.[0], target]);

  return (
    <div className="flex flex-col gap-5">

      {/* Room badge */}
      <div className="text-right font-mono text-xs text-zinc-500">
        Room: <span className="text-zinc-300 font-bold tracking-widest">{room}</span>
      </div>

      {/* Turn banner */}
      <div className={`rounded-xl px-5 py-4 text-center text-base font-bold border transition-all duration-300 ${
        isMyTurn
          ? "bg-linear-to-r from-violet-600/30 to-cyan-600/20 border-violet-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.25)]"
          : "bg-zinc-800 border-zinc-700 text-zinc-400"
      }`}>
        {isMyTurn ? "⚡ Your Turn — Make a Guess!" : `⏳ ${currentTurn} is guessing…`}
      </div>

      {/* Opponent info */}
      {opponent && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700">
          <div className="w-9 h-9 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-lg font-bold text-violet-300">
            {opponent[1][0].toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Opponent</p>
            <p className="text-base font-bold text-white">{opponent[1]}</p>
          </div>
        </div>
      )}

      {/* Guess input */}
      {isMyTurn ? (
        <div className="flex gap-2">
          <input
            type="number"
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-violet-500
                       text-white font-mono font-bold text-lg outline-none transition-colors"
            placeholder="Enter number…"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendGuess()}
            autoFocus
          />
          <button
            onClick={sendGuess}
            disabled={!guess}
            className="px-2 md:px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40
                       disabled:cursor-not-allowed text-white font-bold text-[11.9px] md:text-sm transition-all
                       hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(124,58,237,0.4)] whitespace-nowrap"
          >
            Guess 🎲
          </button>
        </div>
      ) : (
        <div className="bg-zinc-800/60 rounded-xl px-4 py-3 text-center text-sm text-zinc-400">
          Waiting for <span className="font-bold text-zinc-200">{currentTurn}</span> to guess…
        </div>
      )}

      <GuessHistory history={guessHistory} myName={myName} />
    </div>
  );
}