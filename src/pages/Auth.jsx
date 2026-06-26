import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { Button } from '../components/UI/Button'
import toast from 'react-hot-toast'

import { friendlyError } from '../lib/utils'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password)
        toast.success('Welcome back')
      } else {
        await signUp(form.email, form.password, form.name)
        toast.success('Account created. Welcome to TNR Tracker')
      }
      navigate('/')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-sm font-bold tracking-[0.25em] text-green-700 mb-3">TNR</div>
          <h1 className="text-3xl font-bold text-green-800">TNR Tracker</h1>
          <p className="text-gray-600 mt-2">Coordinating care for community cats</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'login' ? 'bg-white shadow text-green-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'signup' ? 'bg-white shadow text-green-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
              <input
                required
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com or admin"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing up, you agree to help community cats.
          </p>
        </div>
      </div>
    </div>
  )
}
