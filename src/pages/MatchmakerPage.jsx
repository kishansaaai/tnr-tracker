import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from '../components/UI/Button'
import { CatAvatar } from '../components/Cats/CatAvatar'
import toast from 'react-hot-toast'
import { getRandomCatGif } from '../lib/catApi'

const questions = [
  {
    id: 1,
    title: "What's your household energy level?",
    options: [
      { id: 'chill', label: 'Very chill (Couch potato vibes) 🛋️', score: 1 },
      { id: 'medium', label: 'Medium (A walk a day) 🚶', score: 2 },
      { id: 'high', label: 'High (Always on the move) 🏃', score: 3 },
    ]
  },
  {
    id: 2,
    title: "Do you have other pets?",
    options: [
      { id: 'no', label: 'Nope, looking for my one and only 👑', score: 1 },
      { id: 'cats', label: 'Yes, other cats 🐈', score: 2 },
      { id: 'dogs', label: 'Yes, dogs or other animals 🐕', score: 3 },
    ]
  },
  {
    id: 3,
    title: "What's your ideal cat activity?",
    options: [
      { id: 'cuddling', label: 'Cuddling and purring 🐾', score: 1 },
      { id: 'playing', label: 'Chasing lasers and toys 🎣', score: 2 },
      { id: 'independent', label: 'Just co-existing peacefully 🪴', score: 3 },
    ]
  }
]

export default function MatchmakerPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingGif, setLoadingGif] = useState(null)
  const [match, setMatch] = useState(null)

  const handleAnswer = (questionId, optionScore) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionScore }))
    if (currentStep < questions.length - 1) {
      setCurrentStep(curr => curr + 1)
    } else {
      findMatch()
    }
  }

  const findMatch = async () => {
    setLoading(true)
    getRandomCatGif().then(gif => setLoadingGif(gif?.url))
    
    try {
      // Fetch adoption ready cats
      const { data: cats, error } = await supabase
        .from('cats')
        .select('*, colony:colonies(name)')
        .eq('pipeline_status', 'adoption_ready')

      if (error) throw error

      if (!cats || cats.length === 0) {
        setMatch('none')
        return
      }

      // Deterministic personality-tag matching algorithm
      const energyAnswer = answers[1] || 2
      const petsAnswer = answers[2] || 2
      const activityAnswer = answers[3] || 2

      let bestMatch = cats[0]
      let highestScore = -1

      for (const cat of cats) {
        // Deterministically generate traits based on cat.id UUID string
        let hash = 0
        for (let i = 0; i < cat.id.length; i++) {
          hash = cat.id.charCodeAt(i) + ((hash << 5) - hash)
        }
        
        // Pseudo-random but deterministic personality stats (1-3 scale)
        const catEnergy = Math.abs(hash % 3) + 1
        const catSocial = Math.abs((hash >> 2) % 3) + 1
        const catAffection = Math.abs((hash >> 4) % 3) + 1

        // Calculate affinity score: lower distance is better.
        const energyDist = Math.abs(energyAnswer - catEnergy)
        const socialDist = Math.abs(petsAnswer - catSocial)
        const activityDist = Math.abs(activityAnswer - catAffection)
        
        const currentScore = 10 - (energyDist + socialDist + activityDist)

        if (currentScore > highestScore) {
          highestScore = currentScore
          bestMatch = cat
        }
      }

      setMatch(bestMatch)

    } catch (e) {
      setMatch('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-rose-600 mb-3 tracking-tight">Cat Matchmaker 💘</h1>
        <p className="text-gray-600 text-lg font-medium">Take our quiz to find your purr-fect companion.</p>
      </div>

      {!match && !loading && (
        <div className="bg-white rounded-3xl border border-rose-100 p-8 shadow-sm text-center">
          <div className="flex justify-center mb-8 gap-2">
            {questions.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2.5 rounded-full transition-all duration-500 ${idx <= currentStep ? 'w-8 bg-rose-500' : 'w-4 bg-gray-200'}`}
              />
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-8">{questions[currentStep].title}</h2>

          <div className="space-y-4">
            {questions[currentStep].options.map(option => (
              <button
                key={option.id}
                onClick={() => handleAnswer(questions[currentStep].id, option.score)}
                className="w-full text-left p-4 rounded-xl border-2 border-rose-50 hover:border-rose-400 hover:bg-rose-50 transition-all font-medium text-gray-700 hover:text-rose-900 active:scale-95"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-20 animate-[fadeIn_0.3s]">
          <div className="w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden shadow-lg border-4 border-rose-100 flex items-center justify-center bg-gray-50">
            {loadingGif ? (
              <img src={loadingGif} alt="Loading..." referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <div className="animate-bounce text-6xl">🐈</div>
            )}
          </div>
          <p className="text-xl font-bold text-gray-500 animate-pulse">Calculating the purr-fect match...</p>
        </div>
      )}

      {match && match !== 'none' && match !== 'error' && (
        <div className="bg-gradient-to-b from-rose-50 to-white rounded-3xl border border-rose-100 p-8 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400"></div>
          
          <span className="inline-block bg-rose-100 text-rose-800 font-black tracking-widest uppercase text-xs px-4 py-1.5 rounded-full mb-6">
            It's a Match!
          </span>

          <div className="flex justify-center mb-6">
            {match.photo_url ? (
              <img src={match.photo_url} alt={match.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <CatAvatar seed={match.name || match.id} className="w-32 h-32 rounded-full border-4 border-white shadow-lg" />
            )}
          </div>

          <h2 className="text-4xl font-black text-gray-900 mb-2">{match.name || 'Unnamed Kitty'}</h2>
          <p className="text-lg text-rose-600 font-medium mb-6">
            Currently residing at <span className="font-bold">{match.colony?.name || 'a local colony'}</span>
          </p>

          <div className="bg-white rounded-xl p-5 border border-rose-50 text-left mb-8 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2 border-b border-rose-50 pb-2">Why you're a match:</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Based on your answers, <strong>{match.name || 'this kitty'}</strong> fits your lifestyle perfectly! They are {match.gender === 'female' ? 'a sweet girl' : 'a handsome boy'} ready for a forever home.
              {match.health_notes && ` Note: ${match.health_notes}`}
            </p>
          </div>

          <div className="flex justify-center gap-4">

            <Button size="lg" variant="secondary" onClick={() => { setMatch(null); setCurrentStep(0); setAnswers({}); }}>
              Retake Quiz
            </Button>
          </div>
        </div>
      )}

      {match === 'none' && (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
          <p className="text-xl font-bold text-gray-700 mb-4">No kitties are currently ready for adoption.</p>
          <Button onClick={() => navigate('/')}>Back to Map</Button>
        </div>
      )}
    </div>
  )
}
