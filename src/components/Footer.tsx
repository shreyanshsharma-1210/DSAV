export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div>© {new Date().getFullYear()} DSA Visualizer AI — Learn algorithms visually.</div>
        <div className="flex gap-6 font-mono text-xs uppercase tracking-widest">
          <span>System: Live</span>
          <span>Engine v1.0</span>
        </div>
      </div>
    </footer>
  );
}
