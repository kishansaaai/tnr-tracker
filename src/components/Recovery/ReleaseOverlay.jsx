import React, { useState, useEffect } from 'react'

export function ReleaseOverlay({ active, onComplete }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (active) {
      // Create some leaves, sparkles, and wind emojis
      const newItems = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        type: ['🍃', '✨', '💨', '🌿'][Math.floor(Math.random() * 4)],
        tx: (Math.random() - 0.5) * 800,
        ty: (Math.random() - 0.5) * 800 - 100,
        delay: Math.random() * 0.4,
        duration: 1.5 + Math.random(),
      }))
      setItems(newItems)

      const timer = setTimeout(() => {
        setItems([])
        if (onComplete) onComplete()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [active, onComplete])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden transition-all">
      <div className="absolute top-1/3 text-center animate-[pop_0.4s_ease-out_forwards] z-10">
        <h2 className="text-7xl font-black text-emerald-600 drop-shadow-[0_4px_8px_rgba(255,255,255,0.8)] mb-2 tracking-widest">FREEDOM! 🐈</h2>
        <p className="text-3xl text-emerald-500 font-bold drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">Cat returned to colony!</p>
      </div>

      {/* Running Cat Animation */}
      <div className="absolute bottom-1/4 left-[-200px] text-[120px] animate-[runAcross_1.2s_ease-in-out_forwards]">
        🐈💨
      </div>

      {items.map(item => (
        <div
          key={item.id}
          className="absolute text-4xl left-1/2 top-1/2"
          style={{
            '--tx': `${item.tx}px`,
            '--ty': `${item.ty}px`,
            animation: `explode ${item.duration}s ease-out forwards`,
            animationDelay: `${item.delay}s`,
            transform: `translate(-50%, -50%) scale(0)`,
            opacity: 0
          }}
        >
          {item.type}
        </div>
      ))}
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5) translateY(50px); opacity: 0; }
          70% { transform: scale(1.1) translateY(0); opacity: 1; }
          90% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(-20px); opacity: 0; }
        }
        @keyframes explode {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 1; }
          20% { opacity: 1; }
          100% { 
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.5) rotate(720deg); 
            opacity: 0; 
          }
        }
        @keyframes runAcross {
          0% { transform: translateX(0) scaleX(-1); }
          10% { transform: translateX(20vw) scaleX(-1) translateY(-50px); }
          20% { transform: translateX(40vw) scaleX(-1) translateY(0); }
          30% { transform: translateX(60vw) scaleX(-1) translateY(-50px); }
          40% { transform: translateX(80vw) scaleX(-1) translateY(0); }
          100% { transform: translateX(120vw) scaleX(-1) translateY(-50px); }
        }
      `}</style>
    </div>
  )
}
