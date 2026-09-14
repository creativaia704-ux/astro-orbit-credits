export type PersonValues = {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
};

export const emptyPerson: PersonValues = {
  name: "",
  birth_date: "",
  birth_time: "",
  birth_place: "",
};

export function isPersonValid(p: PersonValues, today: string) {
  return (
    p.name.trim().length >= 2 &&
    !!p.birth_date &&
    p.birth_date <= today &&
    p.birth_place.trim().length > 0 &&
    p.birth_place.length <= 100
  );
}

const inputClass =
  "w-full rounded-[12px] border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

export function PersonFields({
  idPrefix,
  values,
  onChange,
  today,
  namePlaceholder = "Nombre de la persona",
}: {
  idPrefix: string;
  values: PersonValues;
  onChange: (next: PersonValues) => void;
  today: string;
  namePlaceholder?: string;
}) {
  const set = (field: keyof PersonValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...values, [field]: e.target.value });

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-name`} className="mb-1.5 block text-sm text-muted-foreground">
          Nombre completo
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          required
          minLength={2}
          placeholder={namePlaceholder}
          value={values.name}
          onChange={set("name")}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-date`} className="mb-1.5 block text-sm text-muted-foreground">
          Fecha de nacimiento
        </label>
        <input
          id={`${idPrefix}-date`}
          type="date"
          required
          max={today}
          value={values.birth_date}
          onChange={set("birth_date")}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-time`} className="mb-1.5 block text-sm text-muted-foreground">
          Hora de nacimiento
        </label>
        <input
          id={`${idPrefix}-time`}
          type="time"
          value={values.birth_time}
          onChange={set("birth_time")}
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Si no la conoces, usaremos las 12:00 del mediodía
        </p>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-place`} className="mb-1.5 block text-sm text-muted-foreground">
          Lugar de nacimiento
        </label>
        <input
          id={`${idPrefix}-place`}
          type="text"
          required
          maxLength={100}
          placeholder="Ciudad, País (ej: Barcelona, España)"
          value={values.birth_place}
          onChange={set("birth_place")}
          className={inputClass}
        />
      </div>
    </div>
  );
}
