import { useState } from 'react'
import { Button } from '../UI/Button'
import { getRandomCat } from '../../lib/catApi'

export function AddCatForm({ onAdd, uploading, setUploading }) {
  const [form, setForm] = useState({
    name: '',
    gender: 'unknown',
    neutered: false,
    health_notes: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [breedMatch, setBreedMatch] = useState(null)

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    
    // Kitty Cam AI Simulator
    setScanning(true)
    setScanResult(null)
    setBreedMatch(null)
    setTimeout(async () => {
      setScanning(false)
      const isNeutered = Math.random() > 0.3 // 70% chance to simulate ear-tip found
      if (isNeutered) {
        setForm(p => ({ ...p, neutered: true }))
        setScanResult('🐾 Ear-tip detected! Auto-marked as Neutered.')
      } else {
        setScanResult('🔍 No clear ear-tip detected.')
      }

      const catData = await getRandomCat()
      if (catData?.breeds?.length > 0) {
        setBreedMatch(catData)
      }
    }, 2000)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await onAdd(form, photoFile)
      setForm({ name: '', gender: 'unknown', neutered: false, health_notes: '' })
      setPhotoFile(null)
      setPhotoPreview(null)
      setScanResult(null)
      setBreedMatch(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Photo (optional)</label>
        <div className="flex items-center gap-3">
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl border-2 border-dashed border-gray-300">
              Photo
            </div>
          )}
          <label className="cursor-pointer text-sm text-green-700 font-medium hover:text-green-800 transition-colors">
            {photoPreview ? 'Change photo' : 'Upload photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
          {photoPreview && (
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPhotoPreview(null); setScanResult(null); setBreedMatch(null) }}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Remove
            </button>
          )}
        </div>
        
        {/* Kitty Cam UI */}
        {(scanning || scanResult) && (
          <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm font-medium">
            <div className="flex items-center gap-2 mb-1 text-indigo-800">
              <span className="text-lg">📸</span>
              <span>Kitty Cam AI</span>
            </div>
            {scanning ? (
              <p className="text-indigo-600 animate-pulse flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin inline-block"></span>
                Scanning ear for TNR tip...
              </p>
            ) : (
              <div className="space-y-2">
                <p className={scanResult?.includes('detected') ? 'text-green-700' : 'text-gray-600'}>
                  {scanResult}
                </p>
                {breedMatch && breedMatch.breeds && breedMatch.breeds[0] && (
                  <div className="flex gap-3 bg-white p-2 rounded border border-indigo-100 items-center">
                    <img src={breedMatch.url} alt="Breed Match" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">AI Breed Match:</p>
                      <p className="text-xs text-indigo-600 font-bold">{breedMatch.breeds[0].name}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Mittens"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={form.gender}
            onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* Neutered toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={form.neutered}
            onChange={e => setForm(p => ({ ...p, neutered: e.target.checked }))}
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${form.neutered ? 'bg-green-500' : 'bg-gray-200'}`} />
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.neutered ? 'left-5' : 'left-1'}`} />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {form.neutered ? 'Neutered / Spayed' : 'Not yet neutered'}
        </span>
      </label>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Health Notes</label>
        <textarea
          value={form.health_notes}
          onChange={e => setForm(p => ({ ...p, health_notes: e.target.value }))}
          rows={2}
          placeholder="Any visible injuries, illness, ear tip status..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Log Cat
      </Button>
    </form>
  )
}
