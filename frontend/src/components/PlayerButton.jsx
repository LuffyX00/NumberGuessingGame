import React from "react";

export default function PlayerButton({ id, name, isCurrent, onClick, disabled }) {
  return (
    <button
      onClick={() => onClick(id)}
      disabled={disabled}
      className={`p-2 rounded transition-all duration-300 
                  ${isCurrent ? "bg-green-500 scale-110 shadow-lg" : "bg-gray-700 hover:bg-gray-600"}`}
    >
      {name}
    </button>
  );
}