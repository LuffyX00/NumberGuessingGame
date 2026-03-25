import { useState } from "react";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function JoinRoom({ onJoin }) {
  const [mode, setMode]           = useState("create");
  const [name, setName]           = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [generatedRoom, setGeneratedRoom] = useState(() => generateRoomId());
  const [copied, setCopied]       = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    onJoin(generatedRoom, name.trim());
  };

  const handleJoin = () => {
    if (!name.trim() || !roomInput.trim()) return;
    onJoin(roomInput.trim().toUpperCase(), name.trim());
  };

  const copyRoom = () => {
    navigator.clipboard.writeText(generatedRoom);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshRoom = () => {
    setGeneratedRoom(generateRoomId());
    setCopied(false);
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 " +
    "placeholder-zinc-500 text-sm font-medium outline-none focus:border-violet-500 transition-colors";

  const btnPrimaryCls =
    "w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 " +
    "disabled:cursor-not-allowed text-white font-bold text-sm transition-all " +
    "hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)]";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">🔢</div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Guess the Number</h1>
        <p className="text-zinc-400 text-sm mt-1">2-player multiplayer guessing game</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800 rounded-xl p-1">
        {[
          { key: "create", label: "Create Room" },
          { key: "join",   label: "Join Room"   },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all
              ${mode === key
                ? "bg-violet-600 text-white shadow"
                : "text-zinc-400 hover:text-zinc-200"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3">
        <input
          className={inputCls}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (mode === "create" ? handleCreate() : handleJoin())
          }
        />

        {mode === "create" ? (
          <>
            {/* Generated Room ID */}
            <div className="flex items-center justify-between bg-zinc-800 border border-dashed border-violet-600 rounded-xl px-4 py-3">
              <span className="font-mono text-xl font-bold tracking-[6px] text-cyan-400">
                {generatedRoom}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={copyRoom}
                  title="Copy Room ID"
                  className="px-2.5 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-base transition-colors"
                >
                  {copied ? "✅" : "📋"}
                </button>
                <button
                  onClick={refreshRoom}
                  title="Generate new ID"
                  className="px-2.5 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-base transition-colors"
                >
                  🔄
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-500 text-center">
              Share this Room ID with your friend so they can join
            </p>
            <button
              className={btnPrimaryCls}
              onClick={handleCreate}
              disabled={!name.trim()}
            >
              Create &amp; Join Room
            </button>
          </>
        ) : (
          <>
            <input
              className={`${inputCls} font-mono tracking-widest uppercase`}
              placeholder="Enter Room ID (e.g. AB12CD)"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <button
              className={btnPrimaryCls}
              onClick={handleJoin}
              disabled={!name.trim() || !roomInput.trim()}
            >
              Join Room →
            </button>
          </>
        )}
      </div>
    </div>
  );
}