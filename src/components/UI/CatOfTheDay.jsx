import React, { useState, useEffect } from 'react'
import { getRandomCat } from '../../lib/catApi'
import { CardSkeleton } from '../UI/Skeleton'

export function CatOfTheDay() {
  const [cat, setCat] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRandomCat().then(data => {
      setCat(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <CardSkeleton />

  if (!cat) return null

  const breed = cat.breeds && cat.breeds.length > 0 ? cat.breeds[0] : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>🐱</span> Cat of the Day
        </h2>
      </div>
      <div className="flex-1 relative">
        <img 
          src={cat.url} 
          alt="Cat of the day" 
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      {breed && (
        <div className="p-4 bg-white border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-1">{breed.name}</h3>
          <p className="text-xs text-gray-600 line-clamp-2">{breed.temperament}</p>
        </div>
      )}
    </div>
  )
}
