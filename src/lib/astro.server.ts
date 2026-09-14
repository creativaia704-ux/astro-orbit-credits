// Generación determinista y SIMULADA de posiciones planetarias.
// SUPUESTO (Fase 5): no hay integración con una API de efemérides real.
// Mismo input -> mismo resultado. El contrato de datos (positions/summary)
// se mantendrá cuando se sustituya por un cálculo astronómico real.

const SIGNS = [
  "Aries",
  "Tauro",
  "Géminis",
  "Cáncer",
  "Leo",
  "Virgo",
  "Libra",
  "Escorpio",
  "Sagitario",
  "Capricornio",
  "Acuario",
  "Piscis",
];

const PLANETS = [
  "sun",
  "moon",
  "ascendant",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
] as const;

const THEMES = [
  "Un ciclo de crecimiento personal",
  "Un año de consolidación profesional",
  "Tiempo de introspección y sanación",
  "Ciclo de expansión y nuevos horizontes",
  "Un año de cambios en el hogar y la familia",
  "Ciclo de fortalecimiento en las relaciones",
];

const SUMMARY =
  "Interpretación orientativa generada automáticamente. Próximamente con cálculo astronómico real.";

export type Position = { sign: string; degree: number };
export type Positions = Record<(typeof PLANETS)[number], Position>;

export type PersonInput = {
  name: string;
  birth_date: string;
  birth_time?: string | null;
  birth_place: string;
};

function hashString(input: string): number {
  let hash = 7;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 2147483647;
  }
  return hash;
}

function seedOf(person: PersonInput, extra = ""): number {
  return hashString(
    `${person.name}|${person.birth_date}|${person.birth_time || "12:00"}|${person.birth_place}|${extra}`,
  );
}

function positionsFrom(seed: number): Positions {
  const out = {} as Positions;
  PLANETS.forEach((planet, i) => {
    const value = (seed * (i + 3) + planet.length * 97) % 360000;
    out[planet] = {
      sign: SIGNS[Math.floor(value / 1000) % 12]!,
      degree: Math.round(((value % 30000) / 1000) * 10) / 10,
    };
  });
  return out;
}

export function generateCartaNatal(person: PersonInput) {
  return {
    subject_name: person.name,
    positions: positionsFrom(seedOf(person)),
    summary: SUMMARY,
  };
}

export function generateSinastria(person1: PersonInput, person2: PersonInput) {
  const seed = seedOf(person1) + seedOf(person2);
  return {
    person1: { subject_name: person1.name, positions: positionsFrom(seedOf(person1)) },
    person2: { subject_name: person2.name, positions: positionsFrom(seedOf(person2)) },
    compatibility_score: 40 + (seed % 56),
    summary: SUMMARY,
  };
}

export function generateRevolucionSolar(person: PersonInput, year: number) {
  const seed = seedOf(person, String(year));
  return {
    subject_name: person.name,
    year,
    positions: positionsFrom(seed),
    theme: THEMES[seed % THEMES.length]!,
    summary: SUMMARY,
  };
}
