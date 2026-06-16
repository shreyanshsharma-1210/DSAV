import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DSA Visualizer AI — Visualize Your Code, Understand DSA" },
      {
        name: "description",
        content:
          "Interactive DSA platform: visualize sorting and searching algorithms step-by-step, then sharpen skills in the gamified Arena with quizzes, puzzles and badges.",
      },
      { property: "og:title", content: "DSA Visualizer AI" },
      {
        property: "og:description",
        content: "Visualize Your Code, Understand DSA Like Never Before.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-dvh relative overflow-hidden bg-[#020617] text-[#f8fafc]">
      {/* Background Layer 1 & 2: Void + Radial Energy Glows */}
      <div className="absolute top-[-10%] left-[-20%] size-[800px] glow-orb pointer-events-none" />
      <div
        className="absolute bottom-[-10%] right-[-10%] size-[600px] glow-orb pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(94, 234, 212, 0.15) 0%, rgba(34, 211, 238, 0.05) 50%, transparent 100%)",
        }}
      />

      {/* Layer 3: Interactive SVG Orbital Rings / Particle Waves */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] pointer-events-none opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#visualdsa-glow-gradient)"
            strokeWidth="0.5"
            strokeDasharray="5 15"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="url(#visualdsa-glow-gradient)"
            strokeWidth="0.8"
          />
          <circle
            cx="50"
            cy="50"
            r="25"
            fill="none"
            stroke="url(#visualdsa-glow-gradient)"
            strokeWidth="0.3"
            strokeDasharray="20 4"
          />
          <defs>
            <linearGradient id="visualdsa-glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C7F464" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <Header />

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-6 pt-28 pb-24 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 mb-8 animate-pulse-soft">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                VisualDSA ENGINE V1.0 • RUNNING LIVE
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] text-balance">
              Visualize Code. <br />
              <span className="text-gradient">Master Thinking.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-[52ch] leading-relaxed font-sans">
              VisualDSA is where raw source scripts transform into pure logical understanding. Step
              inside our workspace, control runtime compilation, and watch every swap unfold.
            </p>
            <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-4">
              <Link
                to="/practice"
                className="px-8 py-4 rounded-xl btn-primary-tactile text-sm font-bold hover:btn-primary-tactile-hover"
              >
                Start Visualizing →
              </Link>
              <Link
                to="/arena"
                className="px-8 py-4 rounded-xl btn-secondary-tactile text-sm font-semibold hover:btn-secondary-tactile-hover"
              >
                Enter Arena 🎮
              </Link>
            </div>
          </div>

          {/* Interactive Demo Workstation (Layer 4 & 5: Glass + Content) */}
          <div className="w-full max-w-xl glass-card border border-primary/20 overflow-hidden shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-[#030712]/60">
              <div className="flex gap-2">
                <div className="size-3 rounded-full bg-[#ef4444]/60 border border-[#ef4444]" />
                <div className="size-3 rounded-full bg-[#eab308]/60 border border-[#eab308]" />
                <div className="size-3 rounded-full bg-[#22c55e]/60 border border-[#22c55e]" />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                bubble_sort.visualdsa
              </div>
              <div className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                STEP 04 / 22
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-px bg-border/20">
              {/* Code Panel */}
              <div className="bg-[#030712]/70 p-6 font-mono text-[11px] leading-7">
                <div className="text-muted-foreground/40">01 function bubbleSort(arr) &#123;</div>
                <div className="text-muted-foreground/40">02 let n = arr.length;</div>
                <div className="text-muted-foreground/40">03 for (let i = 0; i &lt; n; i++)</div>
                <div className="-mx-6 px-6 bg-[rgba(199,244,100,0.12)] border-l-2 border-primary text-primary-foreground font-semibold flex items-center justify-between">
                  <span>04 for (let j = 0; j &lt; n-i-1; j++)</span>
                  <span className="text-[8px] font-mono uppercase bg-primary text-black px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <div className="text-muted-foreground/40">05 if (arr[j] &gt; arr[j+1])</div>
                <div className="text-muted-foreground/40">06 swap(arr, j, j+1);</div>
                <div className="text-muted-foreground/40">07 &#125;</div>

                <div className="mt-8 p-4 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-md">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1">
                    AI Feedback
                  </div>
                  <div className="text-[11px] leading-relaxed text-muted-foreground font-sans">
                    Comparing <span className="text-primary font-mono">arr[2] = 8</span> with{" "}
                    <span className="text-primary font-mono">arr[3] = 2</span>. Swapping values in
                    memory space.
                  </div>
                </div>
              </div>

              {/* Visualization Stage */}
              <div className="bg-[#020617]/50 grid-bg p-6 flex flex-col items-center justify-end min-h-[300px] relative">
                <div className="flex items-end justify-center gap-2.5 w-full">
                  {[5, 3, 8, 2, 9, 1, 6].map((v, i) => (
                    <div key={i} className="flex flex-col items-center gap-2" style={{ width: 32 }}>
                      <div
                        className={`w-full rounded-t-lg flex items-start justify-center pt-2 text-[10px] font-bold font-mono transition-all duration-300 ${
                          i === 2 || i === 3
                            ? "bg-gradient-primary text-black shadow-[0_0_15px_rgba(199,244,100,0.4)] border border-white/20"
                            : "bg-[#0b1220] border border-border text-muted-foreground"
                        }`}
                        style={{ height: `${v * 20 + 32}px` }}
                      >
                        {v}
                      </div>
                      <span className="font-mono text-[9px] text-muted-foreground">{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="mx-auto max-w-7xl px-6 py-24 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-primary mb-3">
                / CORE ARCHITECTURE
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight max-w-2xl text-balance">
                Everything you need to master visual computation.
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass-card p-8 group hover:glass-card-hover hover:border-primary/40 relative overflow-hidden"
              >
                {/* SVG Decorative Background Element */}
                <div className="absolute top-[-20%] right-[-20%] size-28 pointer-events-none opacity-5 transition-opacity group-hover:opacity-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                    <rect
                      x="10"
                      y="10"
                      width="80"
                      height="80"
                      rx="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>

                <div className="font-mono text-xs text-primary mb-5 font-bold">
                  [{String(i + 1).padStart(2, "0")}]
                </div>
                <h3 className="text-lg font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL Immersive CTA */}
        <section className="mx-auto max-w-5xl px-6 py-28 relative">
          <div className="relative glass-card border border-primary/30 p-12 md:p-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,244,100,0.1)_0%,transparent_60%)] pointer-events-none" />

            {/* Ambient nodes ornament */}
            <div className="absolute top-10 left-10 w-24 h-24 pointer-events-none opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                <circle cx="20" cy="20" r="5" fill="currentColor" />
                <circle cx="80" cy="30" r="3" fill="currentColor" />
                <line x1="20" y1="20" x2="80" y2="30" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance leading-none">
              Ready to see your code <br />
              <span className="text-gradient">think?</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm leading-relaxed font-sans">
              Enter our compiler workstation. Explore 40 structured algorithms across stacks, trees,
              and networks — then claim your XP rewards.
            </p>
            <Link
              to="/practice"
              className="inline-block mt-8 px-8 py-4 rounded-xl btn-primary-tactile text-sm font-bold hover:btn-primary-tactile-hover"
            >
              Open Workspace Engine
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

const FEATURES = [
  {
    title: "Step-by-step execution",
    desc: "Play, pause, scrub forward and backward through every line of execution at your own pace.",
  },
  {
    title: "Try Your Own Code",
    desc: "Edit algorithm templates in JS, C++, or Java, input custom datasets, and run compiler simulation logs.",
  },
  {
    title: "Interactive Canvas Editor",
    desc: "Draw graph edges, insert tree nodes, and generate input arrays directly on an SVG drawing canvas.",
  },
  {
    title: "40+ DSA Algorithms",
    desc: "Visualize Sorting, Searching, Arrays, Linked Lists, Stacks, Queues, Binary Trees, and Graphs.",
  },
  {
    title: "Complexity at a glance",
    desc: "Time and space complexity charts surfaced dynamically for every algorithm you trace.",
  },
  {
    title: "Gamified Arena",
    desc: "Compete in quizzes, predict outcomes, step-by-step puzzles, earn XP, streaks, and unlock trophies.",
  },
];
