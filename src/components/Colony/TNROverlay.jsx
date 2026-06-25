import React, { useState, useEffect } from 'react'

export function TNROverlay({ active, onComplete }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (active) {
      // Create 60 items of scissors and hearts
      const newItems = Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        type: Math.random() > 0.4 ? '✂️' : '❤️',
        tx: (Math.random() - 0.5) * 1000,
        ty: (Math.random() - 0.5) * 1000 - 200,
        delay: Math.random() * 0.3,
        duration: 1.5 + Math.random(),
        scale: 0.5 + Math.random() * 1.5
      }))
      setItems(newItems)

      // Clean up after animation finishes
      const timer = setTimeout(() => {
        setItems([])
        if (onComplete) onComplete()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [active, onComplete])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden bg-rose-50/60 backdrop-blur-[2px] transition-all">
      <div className="absolute top-1/3 text-center animate-[pop_0.6s_ease-out_forwards]">
        <h2 className="text-6xl font-black text-rose-600 drop-shadow-md mb-2">TNR SUCCESS! 🎉</h2>
        <p className="text-2xl text-rose-500 font-bold drop-shadow-sm">Another kitty saved and neutered!</p>
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
      `}</style>
    </div>
  )
}
