import React, { useState, useEffect } from 'react'

export function FeedAnimation({ active, onComplete }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (active) {
      // Create 40 items of fish and kibble
      const newItems = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        type: Math.random() > 0.4 ? '🐟' : '🧆',
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random()
      }))
      setItems(newItems)

      // Clean up after animation finishes
      const timer = setTimeout(() => {
        setItems([])
        if (onComplete) onComplete()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [active, onComplete])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {items.map(item => (
        <div
          key={item.id}
          className="absolute top-[-50px] text-4xl animate-[fall_linear_forwards]"
          style={{
            left: `${item.left}%`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            animationName: 'fall'
          }}
        >
          {item.type}
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
