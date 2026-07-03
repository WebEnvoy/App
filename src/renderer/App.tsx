import { useEffect, useState } from "react";

type ShellContext = {
  platform: string;
  colorScheme: "light" | "dark";
  configScope: "local-ui-only";
};

const shellRegions = [
  "Electron main: OS window lifecycle only",
  "Preload: local shell context bridge only",
  "Renderer: future Task Thread surface",
];

export function App() {
  const [shellContext, setShellContext] = useState<ShellContext | null>(null);

  useEffect(() => {
    let cancelled = false;

    window.webenvoyShell.getShellContext().then((context) => {
      if (!cancelled) {
        setShellContext(context);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="shell-frame">
      <aside className="shell-sidebar" aria-label="WebEnvoy shell regions">
        <p className="eyebrow">WebEnvoy App</p>
        <h1>Desktop Shell</h1>
        <p className="sidebar-note">
          Task Thread first skeleton. Product layout, source health, Settings, and
          task views are implemented by later GH-100 follow-on work items.
        </p>
      </aside>

      <section className="shell-main" aria-labelledby="shell-status-title">
        <div className="status-card">
          <p className="eyebrow">GH-100</p>
          <h2 id="shell-status-title">Electron / Vite / React / TypeScript is loaded.</h2>
          <p>
            This surface proves the desktop carrier runs without introducing
            App-owned task, run, result, evidence, capability, or session truth.
          </p>
        </div>

        <div className="region-grid">
          {shellRegions.map((region) => (
            <div className="region-card" key={region}>
              {region}
            </div>
          ))}
        </div>

        <dl className="context-list" aria-label="Local shell context">
          <div>
            <dt>Platform</dt>
            <dd>{shellContext?.platform ?? "loading"}</dd>
          </div>
          <div>
            <dt>Color Scheme</dt>
            <dd>{shellContext?.colorScheme ?? "loading"}</dd>
          </div>
          <div>
            <dt>Config Scope</dt>
            <dd>{shellContext?.configScope ?? "loading"}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
