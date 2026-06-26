import { useState, useEffect } from 'react'
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

import { hasKeywordWithoutNegation } from '../lib/utils'

const energyLabels = { 1: 'low-energy', 2: 'medium-energy', 3: 'high-energy' }
const activityLabels = { 1: 'a cuddler', 2: 'a playful companion', 3: 'an independent spirit' }

export default function MatchmakerPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingGif, setLoadingGif] = useState(null)
  const [match, setMatch] = useState(null)
  const [matchScore, setMatchScore] = useState(0)
  const [matchMeta, setMatchMeta] = useState({ usedKeywordOverride: false, energyDist: 0, socialDist: 0, activityDist: 0 })

  useEffect(() => {
    document.title = 'TNR Tracker — Cat Matchmaker'
  }, [])

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

      // Hybrid heuristic matching algorithm
      const energyAnswer = answers[1] || 2
      const petsAnswer = answers[2] || 2
      const activityAnswer = answers[3] || 2

      let bestMatch = cats[0]
      let highestScore = -1
      let bestMatchMeta = { usedKeywordOverride: false, energyDist: 0, socialDist: 0, activityDist: 0 }

      for (const cat of cats) {
        // Deterministically generate base traits using the cat.id UUID hash
        let hash = 0
        for (let i = 0; i < cat.id.length; i++) {
          hash = cat.id.charCodeAt(i) + ((hash << 5) - hash)
        }
        
        let catEnergy = Math.abs(hash % 3) + 1
        let catSocial = Math.abs((hash >> 2) % 3) + 1
        let catAffection = Math.abs((hash >> 4) % 3) + 1
        let usedKeywordOverride = false

        // Heuristically override traits based on real health/personality notes
        const notes = (cat.health_notes || '').toLowerCase()
        const name = (cat.name || '').toLowerCase()
        const textToAnalyze = `${name} ${notes}`
        const matchesKeyword = (kws) => kws.some(kw => hasKeywordWithoutNegation(textToAnalyze, kw))

        // Energy levels parsing
        if (matchesKeyword(['playful', 'active', 'energetic', 'kitten'])) {
          catEnergy = 3
          usedKeywordOverride = true
        } else if (matchesKeyword(['lazy', 'couch', 'calm', 'sleepy', 'quiet'])) {
          catEnergy = 1
          usedKeywordOverride = true
        }

        // Social level parsing (with other pets)
        if (matchesKeyword(['friendly', 'loves cats', 'good with dogs', 'social'])) {
          catSocial = 3
          usedKeywordOverride = true
        } else if (matchesKeyword(['shy', 'scared', 'hates', 'only cat', 'aggressive'])) {
          catSocial = 1
          usedKeywordOverride = true
        }

        // Affection level parsing
        if (matchesKeyword(['cuddly', 'lap', 'sweet', 'affectionate', 'purr'])) {
          catAffection = 1 // Cuddler
          usedKeywordOverride = true
        } else if (matchesKeyword(['independent', 'feral', 'aloof', 'skittish'])) {
          catAffection = 3 // Independent spirit
          usedKeywordOverride = true
        }

        // Calculate affinity score: lower distance is better.
        const energyDist = Math.abs(energyAnswer - catEnergy)
        const socialDist = Math.abs(petsAnswer - catSocial)
        const activityDist = Math.abs(activityAnswer - catAffection)
        
        const totalDist = energyDist + socialDist + activityDist
        // Normalize score: 0 distance -> 10/10, max distance (6) -> 0/10 compatibility
        const currentScore = Math.round(((6 - totalDist) / 6) * 10)

        if (currentScore > highestScore) {
          highestScore = currentScore
          bestMatch = cat
          bestMatchMeta = { usedKeywordOverride, energyDist, socialDist, activityDist }
        }
      }

      setMatchScore(highestScore)
      setMatch(bestMatch)
      setMatchMeta(bestMatchMeta)

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

          {currentStep > 0 && (
            <button
              onClick={() => {
                const prevStep = currentStep - 1
                setAnswers(prev => {
                  const updated = { ...prev }
                  for (let i = currentStep; i < questions.length; i++) {
                    delete updated[questions[i].id]
                  }
                  return updated
                })
                setCurrentStep(prevStep)
              }}
              className="mb-6 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
            >
              ← Back
            </button>
          )}

          <div className="space-y-4">
            {questions[currentStep].options.map(option => {
              const isSelected = answers[questions[currentStep].id] === option.score
              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(questions[currentStep].id, option.score)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium active:scale-95 ${
                    isSelected
                      ? 'border-rose-50 bg-rose-50 text-rose-900 shadow-sm'
                      : 'border-rose-50 hover:border-rose-400 hover:bg-rose-50 text-gray-700 hover:text-rose-900'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
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
          <p className="text-sm text-gray-500 mt-2">
            Match confidence: {matchMeta.usedKeywordOverride ? '🟢 High' : '🟡 Medium'}
            {matchMeta.usedKeywordOverride ? ' (based on personality notes)' : ' (based on general traits)'}
          </p>
          <p className="text-lg text-rose-600 font-medium mb-6">
            Currently residing at <span className="font-bold">{match.colony?.name || 'a local colony'}</span>
          </p>

          <div className="bg-white rounded-xl p-5 border border-rose-50 text-left mb-8 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2 border-b border-rose-50 pb-2">Why you're a match:</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              You're looking for a {energyLabels[answers[1]] || 'balanced'} companion who is {activityLabels[answers[3]] || 'adaptable'}.
              <strong> {match.name || 'This kitty'}</strong> matched your lifestyle with a compatibility score of {matchScore}/10.
              {match.health_notes && ` Note: ${match.health_notes}`}
            </p>
            <div className="flex gap-2 mt-4">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${matchMeta.energyDist === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                Energy {matchMeta.energyDist === 0 ? '✓' : `±${matchMeta.energyDist}`}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${matchMeta.socialDist === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                Social {matchMeta.socialDist === 0 ? '✓' : `±${matchMeta.socialDist}`}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${matchMeta.activityDist === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                Activity {matchMeta.activityDist === 0 ? '✓' : `±${matchMeta.activityDist}`}
              </span>
            </div>
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
