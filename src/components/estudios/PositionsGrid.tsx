const LABELS: Record<string, string> = {
  sun: "Sol",
  moon: "Luna",
  ascendant: "Ascendente",
  mercury: "Mercurio",
  venus: "Venus",
  mars: "Marte",
  jupiter: "Júpiter",
  saturn: "Saturno",
};

export type Positions = Record<string, { sign: string; degree: number }>;

export function PositionsGrid({ positions }: { positions: Positions }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Object.entries(positions).map(([key, pos]) => (
        <div key={key} className="surface-card p-4 text-center">
          <p className="text-sm text-muted-foreground">{LABELS[key] ?? key}</p>
          <p className="font-heading mt-1 text-lg font-semibold">{pos.sign}</p>
          <p className="text-sm text-muted-foreground">{pos.degree}°</p>
        </div>
      ))}
    </div>
  );
}
