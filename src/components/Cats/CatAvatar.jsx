import React from 'react'

const catStyles = [
  { id: 'orange-tabby', body: '#F59E0B', stripe: '#D97706', innerEar: '#FCA5A5' },
  { id: 'tuxedo', body: '#1F2937', face: '#F3F4F6', innerEar: '#F472B6' },
  { id: 'calico', body: '#FFFFFF', patch1: '#F97316', patch2: '#374151', innerEar: '#FCA5A5' },
  { id: 'grey-tabby', body: '#9CA3AF', stripe: '#6B7280', innerEar: '#F472B6' },
  { id: 'black', body: '#111827', innerEar: '#4B5563' },
  { id: 'white', body: '#F9FAFB', innerEar: '#FCA5A5' },
]

const bgColors = ['bg-blue-100', 'bg-rose-100', 'bg-emerald-100', 'bg-amber-100', 'bg-cyan-100', 'bg-indigo-100']

// Simple deterministic hash
function getHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function CatAvatar({ seed = 'Kitty', className = 'w-16 h-16' }) {
  const hash = getHash(seed.toString())
  const style = catStyles[hash % catStyles.length]
  const bgColor = bgColors[hash % bgColors.length]

  return (
    <div className={`${className} rounded-xl ${bgColor} flex items-center justify-center overflow-hidden border border-white/50 shadow-sm relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full transform scale-110 translate-y-1">
        {/* Ears */}
        <polygon points="20,50 10,15 40,35" fill={style.body} />
        <polygon points="80,50 90,15 60,35" fill={style.body} />
        
        {/* Inner Ears */}
        <polygon points="22,45 15,22 35,35" fill={style.innerEar} />
        <polygon points="78,45 85,22 65,35" fill={style.innerEar} />

        {/* Head */}
        <ellipse cx="50" cy="55" rx="35" ry="28" fill={style.body} />

        {/* Style-specific details */}
        {style.id === 'tuxedo' && (
          <path d="M50 83 C 35 83, 25 70, 25 55 C 25 45, 50 35, 50 35 C 50 35, 75 45, 75 55 C 75 70, 65 83, 50 83 Z" fill={style.face} />
        )}
        {style.id === 'calico' && (
          <>
            <ellipse cx="30" cy="40" rx="15" ry="12" fill={style.patch1} transform="rotate(-15 30 40)" />
            <ellipse cx="70" cy="50" rx="18" ry="14" fill={style.patch2} transform="rotate(20 70 50)" />
            <ellipse cx="50" cy="30" rx="12" ry="8" fill={style.patch2} />
          </>
        )}
        {(style.id === 'orange-tabby' || style.id === 'grey-tabby') && (
          <>
            <polygon points="50,27 45,35 55,35" fill={style.stripe} />
            <polygon points="40,30 35,38 45,38" fill={style.stripe} />
            <polygon points="60,30 55,38 65,38" fill={style.stripe} />
            <path d="M15 50 Q 25 45 20 60" stroke={style.stripe} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M85 50 Q 75 45 80 60" stroke={style.stripe} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Eyes */}
        <circle cx="35" cy="50" r="5" fill="#111827" />
        <circle cx="65" cy="50" r="5" fill="#111827" />
        <circle cx="33" cy="48" r="1.5" fill="#FFFFFF" />
        <circle cx="63" cy="48" r="1.5" fill="#FFFFFF" />

        {/* Nose */}
        <polygon points="45,60 55,60 50,65" fill="#FCA5A5" />

        {/* Mouth */}
        <path d="M50 65 Q 45 70 40 68" stroke="#111827" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M50 65 Q 55 70 60 68" stroke="#111827" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Whiskers */}
        <path d="M30 60 L 10 55" stroke="#111827" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M30 63 L 10 63" stroke="#111827" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M70 60 L 90 55" stroke="#111827" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M70 63 L 90 63" stroke="#111827" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3" />
      </svg>
    </div>
  )
}
