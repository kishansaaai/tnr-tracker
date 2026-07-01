import { Link } from "react-router-dom";
import { PawIcon, Reveal } from "./Decorative";
import catSleeping from "../../assets/cat-sleeping.png";

export function Navbar() {
  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4">
      <nav className="mx-auto max-w-5xl glass-strong rounded-full px-5 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-display font-bold" onClick={(e) => handleScroll(e, "mission")}>
          <span className="grid place-items-center h-8 w-8 rounded-full bg-gradient-warm">
            <PawIcon size={16} className="text-white" />
          </span>
          <span className="hidden sm:inline">TNR Tracker</span>
        </a>
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors" onClick={(e) => handleScroll(e, "features")}>Features</a>
          <a href="#join" className="hover:text-foreground transition-colors" onClick={(e) => handleScroll(e, "join")}>Newsletter</a>
        </div>
        <Link to="/auth" className="text-sm font-semibold rounded-full px-4 py-1.5 bg-gradient-warm text-white shadow-warm-glow hover:opacity-95 transition">
          Sign In
        </Link>
      </nav>
    </header>
  );
}

import { useState } from "react";
import { toast } from "react-hot-toast";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Thanks for joining the mission! 🐾", {
        style: {
          border: '1px solid rgba(45, 106, 79, 0.1)',
          padding: '16px',
          color: '#2d6a4f',
        },
        iconTheme: {
          primary: '#2d6a4f',
          secondary: '#ffffff',
        },
      });
      setEmail("");
    }, 1000);
  };

  return (
    <footer id="join" className="relative px-6 pt-20 pb-10">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="glass-strong relative rounded-3xl p-8 md:p-12 text-center overflow-visible"
            style={{ boxShadow: "var(--shadow-card)" }}>
            <img
              src={catSleeping}
              alt="3D calico cat curled up sleeping"
              loading="lazy"
              className="hidden md:block absolute -top-16 -right-6 w-40 lg:w-48 drop-shadow-2xl pointer-events-none rotate-6"
            />
            <h3 className="font-display text-3xl md:text-4xl font-bold relative">
              Join the <span className="text-gradient-warm">mission</span>
            </h3>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Monthly updates on new features, colony success stories, and ways to help. No spam — pinky paw promise.
            </p>
            <form className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
              onSubmit={handleSubmit}>
              <input
                type="email" 
                required 
                placeholder="you@goodhuman.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="flex-1 glass rounded-full px-5 py-3 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--amber)] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white bg-gradient-warm shadow-warm-glow lift-on-hover disabled:opacity-50 disabled:pointer-events-none"
              >
                <PawIcon size={18} /> {loading ? "Joining..." : "Subscribe"}
              </button>
            </form>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <span className="grid place-items-center h-7 w-7 rounded-full bg-gradient-warm">
              <PawIcon size={14} className="text-white" />
            </span>
            TNR Tracker
          </div>
          <p>© {new Date().getFullYear()} TNR Tracker · Made with 🐾</p>
        </div>
      </div>
    </footer>
  );
}
