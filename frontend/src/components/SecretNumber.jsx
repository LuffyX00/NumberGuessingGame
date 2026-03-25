import { useState } from "react";

export default function SecretNumber({ onSubmit, players, myId }) {
  const [secret, setSecret] = useState("");

  const otherPlayer = Object.entries(players).find(([id]) => id !== myId);
  const otherName   = otherPlayer ? otherPlayer[1] : null;

  return (
    <div className="flex flex-col items-center gap-5 text-center py-2">
      <div className="text-5xl">🔒</div>

      <div>
        <h2 className="text-xl font-extrabold text-white">Set Your Secret Number</h2>
        <p className="text-zinc-400 text-sm mt-1">
          {otherName
            ? <><span className="text-violet-400 font-bold">{otherName}</span> will try to guess it!</>
            : "Your opponent will try to guess it!"}
        </p>
      </div>

      <input
        type="number"
        autoFocus
        className="w-44 px-4 py-4 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-violet-500
                   text-center text-2xl font-mono font-bold tracking-widest text-white outline-none transition-colors"
        placeholder="···"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && secret && onSubmit(Number(secret))}
      />

      <button
        onClick={() => onSubmit(Number(secret))}
        disabled={!secret}
        className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40
                   disabled:cursor-not-allowed text-white font-bold text-sm transition-all
                   hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)]"
      >
        Lock It In 🔐
      </button>

      {!otherName && (
        <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 w-full">
          ⚠️ Waiting for your opponent to join the room first
        </p>
      )}
    </div>
  );
}