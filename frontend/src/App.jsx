import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Confetti from "react-confetti";
import JoinRoom from "./components/JoinRoom";
import SecretNumber from "./components/SecretNumber";
import GameBoard from "./components/GameBoard";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
const socket = io(SOCKET_URL, { autoConnect: false });

const toastStyles = {
  hint:    "bg-violet-600 text-white",
  error:   "bg-red-500 text-white",
  success: "bg-emerald-500 text-white",
  info:    "bg-zinc-700 text-zinc-100 border border-zinc-600",
};

export default function App() {
  const [myName, setMyName]               = useState("");
  const [myId, setMyId]                   = useState("");
  const myIdRef                           = useRef("");
  const [room, setRoom]                   = useState("");
  const [joined, setJoined]               = useState(false);
  const [players, setPlayers]             = useState({});
  const [currentTurn, setCurrentTurn]     = useState("");
  const [target, setTarget]               = useState("");
  const [guess, setGuess]                 = useState("");
  const [secretSet, setSecretSet]         = useState(false);
  const [gameStarted, setGameStarted]     = useState(false);
  const [winner, setWinner]               = useState("");
  const [guessHistory, setGuessHistory]   = useState([]);
  const [toast, setToast]                 = useState(null);
  const [waitingStatus, setWaitingStatus] = useState(null);
  const toastTimer         = useRef(null);
  const lastGuessIndexRef  = useRef(null);  // ✅ unified ref for all guesses

  const showToast = (msg, type = "info") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setMyId(socket.id);
      myIdRef.current = socket.id;  // ✅ keep ref in sync
    });

    socket.on("players", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("game_start", (firstPlayerName) => {
      setCurrentTurn(firstPlayerName);
      setGameStarted(true);
      setWaitingStatus(null);
    });

    socket.on("turn", (playerName) => {
      setCurrentTurn(playerName);
    });

    socket.on("winner", (msg) => {
      setWinner(msg);
      // ✅ Mark last guess as correct
      if (lastGuessIndexRef.current !== null) {
        setGuessHistory(prev => prev.map((g, i) =>
          i === lastGuessIndexRef.current ? { ...g, result: "🎉 Correct!" } : g
        ));
        lastGuessIndexRef.current = null;
      }
    });

    socket.on("result", (msg) => {
      const type = msg.includes("low") || msg.includes("high") ? "hint"
        : msg.includes("⛔") ? "error" : "success";
      showToast(msg, type);

      // ✅ Update result for the last guess entry
      if (lastGuessIndexRef.current !== null) {
        setGuessHistory(prev => prev.map((g, i) =>
          i === lastGuessIndexRef.current ? { ...g, result: msg } : g
        ));
        lastGuessIndexRef.current = null;
      }
    });

    socket.on("waiting_status", ({ ready, total }) => {
      setWaitingStatus({ ready, total });
    });

    socket.on("player_left", () => {
      setGameStarted(false);
      setSecretSet(false);
      setTarget("");
      setGuess("");
      setCurrentTurn("");
      setWaitingStatus(null);
      showToast("Opponent disconnected. Waiting for them to rejoin…", "error");
    });

    socket.on("error_msg", (msg) => showToast(msg, "error"));

    socket.on("restart", () => {
      setGameStarted(false);
      setSecretSet(false);
      setTarget("");
      setGuess("");
      setWinner("");
      setGuessHistory([]);
      setCurrentTurn("");
      setWaitingStatus(null);
      lastGuessIndexRef.current = null;  // ✅ reset ref on restart
    });

    return () => { socket.offAny(); socket.disconnect(); };
  }, []);

  const joinRoom = (roomId, name) => {
    setRoom(roomId);
    setMyName(name);
    socket.emit("join_room", { room: roomId, name });
    setJoined(true);
  };

  const sendSecret = (secret) => {
    socket.emit("set_secret", { room, number: Number(secret) });
    setSecretSet(true);
  };

  const sendGuess = () => {
    // ✅ Always compute opponent fresh using ref
    const opponentEntry = Object.entries(players).find(([id]) => id !== myIdRef.current);
    if (!opponentEntry) { showToast("No opponent found!", "error"); return; }
    if (!guess)         { showToast("Enter a number!", "error"); return; }

    const [opponentId, opponentName] = opponentEntry;

    // ✅ Add to history and track its index
    setGuessHistory(prev => {
      const newEntry = {
        player: myName,
        target: opponentName,
        guess: Number(guess),
        result: null,
      };
      lastGuessIndexRef.current = prev.length;
      return [...prev, newEntry];
    });

    socket.emit("guess", { room, target: opponentId, guess: Number(guess) });
    setGuess("");
  };

  const playAgain = () => {
    setWinner("");
    socket.emit("restart", { room });
  };

  const isMyTurn = currentTurn === myName;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(109,40,217,0.28) 0%, transparent 60%)," +
          "radial-gradient(ellipse 50% 40% at 90% 100%, rgba(6,182,212,0.12) 0%, transparent 60%)," +
          "#0b0b12",
      }}
    >
      {winner && <Confetti numberOfPieces={300} recycle={false} />}

      {toast && (
        <div className={`fixed top-5 left-1/2 z-50 px-5 py-3 rounded-full text-sm font-bold shadow-2xl whitespace-nowrap animate-slide-down font-mono ${toastStyles[toast.type]}`}>
          {toast.msg}
        </div>
      )}

      <div className="w-full max-w-md bg-[#111118] border border-[#22223a] rounded-2xl p-8 shadow-[0_0_60px_rgba(109,40,217,0.15),0_24px_48px_rgba(0,0,0,0.5)]">
        {!joined ? (
          <JoinRoom onJoin={joinRoom} />
        ) : winner ? (
          <WinnerScreen winner={winner} onPlayAgain={playAgain} />
        ) : !secretSet ? (
          <SecretNumber onSubmit={sendSecret} players={players} myId={myId} />
        ) : !gameStarted ? (
          <WaitingScreen players={players} waitingStatus={waitingStatus} room={room} />
        ) : (
          <GameBoard
            players={players} myId={myId} myIdRef={myIdRef} myName={myName}
            currentTurn={currentTurn} isMyTurn={isMyTurn}
            target={target} setTarget={setTarget}
            guess={guess} setGuess={setGuess}
            sendGuess={sendGuess} guessHistory={guessHistory} room={room}
          />
        )}
      </div>
    </div>
  );
}

function WinnerScreen({ winner, onPlayAgain }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-4">
      <div className="text-7xl animate-bounce-slow">🏆</div>
      <h1 className="text-3xl font-extrabold tracking-tight text-white">{winner}</h1>
      <button onClick={onPlayAgain}
        className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-base transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(124,58,237,0.5)]">
        🔁 Play Again
      </button>
    </div>
  );
}

function WaitingScreen({ players, waitingStatus, room }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center py-4">
      <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-violet-500 animate-spin-slow" />
      <div>
        <h2 className="text-lg font-bold text-white">Secret locked in! ✅</h2>
        <p className="text-sm text-zinc-400 mt-1">
          {waitingStatus
            ? `${waitingStatus.ready} / ${waitingStatus.total} players ready`
            : "Waiting for the other player to set their secret…"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.values(players).map((n) => (
          <span key={n} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-sm font-semibold text-zinc-200">{n}</span>
        ))}
      </div>
      <div className="bg-zinc-800 border border-dashed border-violet-600/50 rounded-xl px-4 py-3 w-full">
        <p className="text-xs text-zinc-500 mb-1">Share this Room ID with your friend</p>
        <p className="font-mono text-xl font-bold tracking-[6px] text-cyan-400">{room}</p>
      </div>
    </div>
  );
}