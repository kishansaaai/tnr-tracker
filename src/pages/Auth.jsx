import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react"
import toast from 'react-hot-toast'

import { useAuth } from '../hooks/useAuth.jsx'
import catSleeping from '../assets/cat-sleeping.png'

function PawIcon({ className, style, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <ellipse cx="6" cy="9" rx="1.7" ry="2.3" />
      <ellipse cx="10" cy="6" rx="1.7" ry="2.3" />
      <ellipse cx="14" cy="6" rx="1.7" ry="2.3" />
      <ellipse cx="18" cy="9" rx="1.7" ry="2.3" />
      <path d="M12 11.5c-3.2 0-5.8 2.4-5.8 5 0 1.9 1.5 3 3.5 3 1.1 0 1.6-.5 2.3-.5s1.2.5 2.3.5c2 0 3.5-1.1 3.5-3 0-2.6-2.6-5-5.8-5z" />
    </svg>
  )
}

function Field({ id, label, icon, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden
        >
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}

export default function Auth() {
  const navigate = useNavigate()
  const { user, signIn, signUp } = useAuth()

  const [mode, setMode] = useState("signin")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      if (mode === "signin") {
        await signIn(email, password)
        toast.success("Welcome back!")
      } else {
        if (!fullName.trim()) throw new Error("Please enter your name.")
        await signUp(email, password, fullName.trim())
        toast.success("Account created — welcome to TNR Tracker!")
      }
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.message || "Something went wrong"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden section-mint px-4 py-12"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full opacity-60 blur-3xl"
        style={{ background: "var(--amber)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full opacity-50 blur-3xl"
        style={{ background: "var(--forest)" }}
      />
      <img
        src={catSleeping}
        alt=""
        aria-hidden
        width={180}
        height={180}
        loading="lazy"
        className="pointer-events-none absolute -top-6 right-8 hidden h-44 w-44 rotate-6 drop-shadow-2xl md:block lg:right-24 animate-float-y"
      />
      <PawIcon
        aria-hidden
        className="pointer-events-none absolute bottom-12 left-10 hidden h-12 w-12 opacity-40 md:block animate-float-y"
        style={{ color: "var(--sage)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Whimsical cat ears perched on top of the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-5 left-1/2 z-20 flex w-48 -translate-x-1/2 justify-between px-2"
        >
          <div
            className="h-12 w-12 rotate-12 rounded-tl-lg rounded-tr-3xl border-l-4 border-t-4 shadow-sm"
            style={{
              background: "white",
              borderColor: "var(--sage)",
            }}
          />
          <div
            className="h-12 w-12 -rotate-12 rounded-tl-3xl rounded-tr-lg border-r-4 border-t-4 shadow-sm"
            style={{
              background: "white",
              borderColor: "var(--sage)",
            }}
          />
        </div>

        {/* Peeking cat tucked behind the card's bottom-right */}
        <svg
          aria-hidden
          viewBox="0 0 120 100"
          className="pointer-events-none absolute -right-12 -bottom-2 z-0 hidden h-24 w-28 drop-shadow-md lg:block animate-float-y"
        >
          <path d="M20 100C20 70 40 50 60 50C80 50 100 70 100 100" fill="white" />
          <path d="M20 50L35 65" stroke="white" strokeWidth="8" strokeLinecap="round" />
          <path d="M100 50L85 65" stroke="white" strokeWidth="8" strokeLinecap="round" />
          <circle cx="45" cy="75" r="4" fill="var(--forest)" />
          <circle cx="75" cy="75" r="4" fill="var(--forest)" />
          <path
            d="M55 85C55 85 60 88 65 85"
            stroke="var(--coral)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        <section
          className="relative z-10 w-full rounded-3xl p-8 sm:p-10 glass-strong lift-on-hover overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.88)",
            boxShadow: "var(--shadow-card)",
            borderColor: "rgba(45, 106, 79, 0.14)",
          }}
        >
          {/* Soft paw watermark inside the card */}
          <PawIcon
            aria-hidden
            className="pointer-events-none absolute right-6 top-6 h-16 w-16 rotate-12 opacity-15"
            style={{ color: "var(--mint)" }}
          />
          <PawIcon
            aria-hidden
            className="pointer-events-none absolute -left-3 bottom-10 h-10 w-10 -rotate-12 opacity-10"
            style={{ color: "var(--sage)" }}
          />
          {/* Brand */}
          <div className="flex flex-col items-center text-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--amber), var(--coral))",
                boxShadow: "var(--shadow-glow-amber)",
              }}
            >
              <PawIcon className="h-7 w-7" />
            </span>
            <h1
              className="mt-4 text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--forest)" }}
            >
              TNR Tracker
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Coordinating care for community cats
            </p>
          </div>

          {/* Mode toggle */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="mt-7 grid grid-cols-2 gap-1 rounded-full p-1"
            style={{
              background: "var(--mint)",
              border: "1px solid rgba(45, 106, 79, 0.14)",
            }}
          >
            {["signin", "signup"].map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(m)}
                  className={`h-9 rounded-full text-sm font-semibold transition-all ${
                    active
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  style={
                    active
                      ? {
                          background: "linear-gradient(135deg, var(--forest), var(--sage))",
                          boxShadow: "0 6px 14px -6px rgba(45,106,79,0.45)",
                        }
                      : undefined
                  }
                >
                  {m === "signin" ? "Sign in" : "Sign up"}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <Field
                id="name"
                label="Your name"
                icon={<UserIcon className="h-4 w-4" />}
              >
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="glass w-full h-12 rounded-full border border-gray-200 pl-11 pr-4 outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
              </Field>
            )}

            <Field id="email" label="Email" icon={<Mail className="h-4 w-4" />}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="glass w-full h-12 rounded-full border border-gray-200 pl-11 pr-4 outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            </Field>

            <Field id="password" label="Password" icon={<Lock className="h-4 w-4" />}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass w-full h-12 rounded-full border border-gray-200 pl-11 pr-12 outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </Field>
            
            {mode === "signin" && (
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('judge-demo@tnrtracker.app')
                    setPassword('TNRDemo2026!')
                  }}
                  className="text-xs font-semibold hover:underline cursor-pointer"
                  style={{ color: "var(--coral)" }}
                >
                  🐾 Use Judge Demo Login
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 h-12 w-full flex items-center justify-center rounded-full text-base font-semibold text-white border-0 hover:opacity-95 disabled:opacity-80 transition-opacity"
              style={{
                background: "linear-gradient(135deg, var(--amber), var(--coral))",
                boxShadow: "var(--shadow-glow-amber)",
              }}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <PawIcon className="mr-2 h-5 w-5" />
              )}
              {mode === "signin"
                ? submitting
                  ? "Signing in…"
                  : "Sign in"
                : submitting
                  ? "Creating account…"
                  : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-semibold transition-opacity hover:opacity-80"
                  style={{ color: "var(--coral)" }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-semibold transition-opacity hover:opacity-80"
                  style={{ color: "var(--forest)" }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </section>
      </div>
    </main>
  )
}
