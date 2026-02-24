import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#020617]/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative size-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-[0_0_15px_rgba(199,244,100,0.3)] transition-transform group-hover:scale-105">
            <div className="size-3.5 rounded-md rotate-45 bg-[#020617] flex items-center justify-center">
              <div className="size-1.5 rounded-sm bg-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-xl border border-white/20" />
          </div>
          <span className="font-bold tracking-tight text-lg text-foreground font-sans">
            ALCHEMY{" "}
            <span className="text-[10px] font-mono tracking-widest text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 ml-1">
              ENGINE
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 text-sm">
          <Link
            to="/practice"
            activeProps={{ className: "text-primary bg-primary/10 border-primary/30" }}
            inactiveProps={{
              className:
                "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/5",
            }}
            className="px-4 py-1.5 rounded-full border text-xs font-mono uppercase tracking-widest transition-all"
          >
            Visualizer
          </Link>
          <Link
            to="/sandbox"
            activeProps={{ className: "text-primary bg-primary/10 border-primary/30" }}
            inactiveProps={{
              className:
                "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/5",
            }}
            className="px-4 py-1.5 rounded-full border text-xs font-mono uppercase tracking-widest transition-all"
          >
            Sandbox
          </Link>
          <Link
            to="/learn"
            activeProps={{ className: "text-primary bg-primary/10 border-primary/30" }}
            inactiveProps={{
              className:
                "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/5",
            }}
            className="px-4 py-1.5 rounded-full border text-xs font-mono uppercase tracking-widest transition-all"
          >
            Learn
          </Link>
          <Link
            to="/arena"
            activeProps={{ className: "text-primary bg-primary/10 border-primary/30" }}
            inactiveProps={{
              className:
                "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/5",
            }}
            className="px-4 py-1.5 rounded-full border text-xs font-mono uppercase tracking-widest transition-all"
          >
            Arena
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono tracking-wider font-semibold text-primary">
            <span className="size-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="hidden sm:inline">ALCHEMY CORE ACTIVE</span>
            <span className="inline sm:hidden">ACTIVE</span>
          </div>

          <Link
            to="/practice"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl btn-primary-tactile text-sm font-semibold hover:btn-primary-tactile-hover"
          >
            Start Visualizing
          </Link>
        </div>
      </div>
    </header>
  );
}
