import React, { useState, useEffect } from 'react'
import { getRandomCat } from '../../lib/catApi'
import { Button } from '../UI/Button'

export function CatRewardModal({ onDismiss }) {
  const [cat, setCat] = useState(null)
  
  useEffect(() => {
    getRandomCat().then(data => setCat(data))
  }, [])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 text-center animate-[pop_0.4s_ease-out_forwards]">
        <h2 className="text-2xl font-black text-emerald-600 mb-2">You saved a life!</h2>
        <p className="text-gray-600 mb-6 font-medium">As a reward, here is a cute cat to brighten your day:</p>
        
        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-6 border-4 border-emerald-50 relative">
          {!cat ? (
            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">🐈</div>
          ) : (
            <img src={cat.url} alt="Reward Cat" className="w-full h-full object-cover animate-[fadeIn_0.5s_ease-in]" />
          )}
        </div>

        <Button className="w-full" size="lg" onClick={onDismiss}>
          Awesome!
        </Button>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}
