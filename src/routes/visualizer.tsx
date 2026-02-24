import { createFileRoute, redirect } from "@tanstack/react-router";

type VisualizerSearch = { algo?: string };

export const Route = createFileRoute("/visualizer")({
  validateSearch: (search: Record<string, unknown>): VisualizerSearch => ({
    algo: typeof search.algo === "string" ? search.algo : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/practice",
      search: search.algo ? { algo: search.algo } : {},
    });
  },
  component: () => null,
});
