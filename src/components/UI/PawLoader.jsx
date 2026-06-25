import React from 'react'

export function PawLoader({ text = "Loading TNR Tracker..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-40 h-20 mb-6">
        <div className="absolute opacity-0 text-3xl animate-[walk_2s_infinite] top-0 left-0 -rotate-12" style={{ animationDelay: '0s' }}>🐾</div>
        <div className="absolute opacity-0 text-3xl animate-[walk_2s_infinite] top-8 left-10 rotate-12" style={{ animationDelay: '0.5s' }}>🐾</div>
        <div className="absolute opacity-0 text-3xl animate-[walk_2s_infinite] top-0 left-20 -rotate-12" style={{ animationDelay: '1.0s' }}>🐾</div>
        <div className="absolute opacity-0 text-3xl animate-[walk_2s_infinite] top-8 left-30 rotate-12" style={{ animationDelay: '1.5s' }}>🐾</div>
      </div>
      <p className="text-gray-500 text-sm font-bold tracking-widest uppercase animate-pulse">
        {text}
      </p>

      <style>{`
        @keyframes walk {
          0% { opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; transform: scale(1.1); }
          40% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
