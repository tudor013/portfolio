/**
 * Tudor's airline reservations schema, transcribed from his drawDB file
 * (schema_companie_aeriana_aranjat.json): the ten tables at the positions he
 * placed them, and the thirteen foreign keys. Table names drop the course's
 * D2026_ prefix on screen; the description keeps it.
 *
 * Only the columns that carry a key or a constraint are drawn. The rest are
 * counted in a "+N more" row, so the drawing stays readable at a size where
 * every label is at least 13px, and nothing about the table is hidden.
 */

export type Field = { name: string; key?: 'pk' | 'fk' | 'pkfk' };

export type Table = {
  id: string;
  /** Position from the drawDB file, in its own units. */
  x: number;
  y: number;
  fields: Field[];
  /** Columns not drawn. */
  more: number;
};

export type Relation = {
  name: string;
  from: { table: string; field: string };
  to: { table: string; field: string };
};

// In the order a schema like this is usually built: the fleet, the places,
// the flights, the people, and the sale last, because it depends on all of it.
export const TABLES: Table[] = [
  { id: 'MODELE_AVION', x: 0, y: 0, fields: [{ name: 'id_model', key: 'pk' }], more: 4 },
  {
    id: 'AVIOANE',
    x: 408,
    y: 0,
    fields: [
      { name: 'id_avion', key: 'pk' },
      { name: 'id_model', key: 'fk' },
    ],
    more: 4,
  },
  { id: 'AEROPORTURI', x: 0, y: 336, fields: [{ name: 'id_aeroport', key: 'pk' }], more: 4 },
  {
    id: 'RUTE',
    x: 408,
    y: 336,
    fields: [
      { name: 'id_ruta', key: 'pk' },
      { name: 'id_aeroport_plecare', key: 'fk' },
      { name: 'id_aeroport_sosire', key: 'fk' },
    ],
    more: 2,
  },
  {
    id: 'ZBORURI',
    x: 816,
    y: 144,
    fields: [
      { name: 'id_zbor', key: 'pk' },
      { name: 'id_ruta', key: 'fk' },
      { name: 'id_avion', key: 'fk' },
    ],
    more: 7,
  },
  {
    id: 'ANGAJATI',
    x: 0,
    y: 696,
    fields: [
      { name: 'id_angajat', key: 'pk' },
      { name: 'id_manager', key: 'fk' },
      { name: 'id_aeroport_baza', key: 'fk' },
    ],
    more: 7,
  },
  {
    id: 'ECHIPAJ',
    x: 408,
    y: 696,
    fields: [
      { name: 'id_zbor', key: 'pkfk' },
      { name: 'id_angajat', key: 'pkfk' },
      { name: 'rol' },
    ],
    more: 0,
  },
  { id: 'PASAGERI', x: 1632, y: 360, fields: [{ name: 'id_pasager', key: 'pk' }], more: 6 },
  {
    id: 'REZERVARI',
    x: 1632,
    y: 0,
    fields: [
      { name: 'id_rezervare', key: 'pk' },
      { name: 'id_pasager', key: 'fk' },
    ],
    more: 4,
  },
  {
    id: 'BILETE',
    x: 1224,
    y: 144,
    fields: [
      { name: 'id_bilet', key: 'pk' },
      { name: 'id_rezervare', key: 'fk' },
      { name: 'id_zbor', key: 'fk' },
      { name: 'id_pasager', key: 'fk' },
      { name: 'loc' },
    ],
    more: 3,
  },
];

const rel = (name: string, from: string, to: string): Relation => {
  const [fromTable, fromField] = from.split('.');
  const [toTable, toField] = to.split('.');
  return { name, from: { table: fromTable, field: fromField }, to: { table: toTable, field: toField } };
};

export const RELATIONS: Relation[] = [
  rel('fk_d2026_avion_model', 'AVIOANE.id_model', 'MODELE_AVION.id_model'),
  rel('fk_d2026_ruta_plecare', 'RUTE.id_aeroport_plecare', 'AEROPORTURI.id_aeroport'),
  rel('fk_d2026_ruta_sosire', 'RUTE.id_aeroport_sosire', 'AEROPORTURI.id_aeroport'),
  rel('fk_d2026_zbor_ruta', 'ZBORURI.id_ruta', 'RUTE.id_ruta'),
  rel('fk_d2026_zbor_avion', 'ZBORURI.id_avion', 'AVIOANE.id_avion'),
  rel('fk_d2026_ang_manager', 'ANGAJATI.id_manager', 'ANGAJATI.id_angajat'),
  rel('fk_d2026_ang_aeroport', 'ANGAJATI.id_aeroport_baza', 'AEROPORTURI.id_aeroport'),
  rel('fk_d2026_echipaj_zbor', 'ECHIPAJ.id_zbor', 'ZBORURI.id_zbor'),
  rel('fk_d2026_echipaj_ang', 'ECHIPAJ.id_angajat', 'ANGAJATI.id_angajat'),
  rel('fk_d2026_rez_pasager', 'REZERVARI.id_pasager', 'PASAGERI.id_pasager'),
  rel('fk_d2026_bilet_rez', 'BILETE.id_rezervare', 'REZERVARI.id_rezervare'),
  rel('fk_d2026_bilet_zbor', 'BILETE.id_zbor', 'ZBORURI.id_zbor'),
  rel('fk_d2026_bilet_pasager', 'BILETE.id_pasager', 'PASAGERI.id_pasager'),
];

/**
 * The three rules the scene stops on. Each names the rows it lights up; the
 * first two are composite unique constraints on BILETE, the third is the
 * table that refers to itself.
 */
export const RULES = [
  {
    id: 'seat',
    name: 'uq_d2026_bilet_loc_zbor',
    title: 'One seat, one flight.',
    text: 'The flight and the seat are unique together, so the same seat cannot be sold twice on one flight.',
    rows: [
      ['BILETE', 'id_zbor'],
      ['BILETE', 'loc'],
    ],
  },
  {
    id: 'passenger',
    name: 'uq_d2026_bilet_pas_zbor',
    title: 'One ticket per passenger.',
    text: 'The flight and the passenger are unique together, so nobody holds two tickets for the same flight.',
    rows: [
      ['BILETE', 'id_zbor'],
      ['BILETE', 'id_pasager'],
    ],
  },
  {
    id: 'manager',
    name: 'fk_d2026_ang_manager',
    title: 'A manager is an employee.',
    text: 'The manager column points back into the same table, so the hierarchy is part of the data, not a guess.',
    rows: [
      ['ANGAJATI', 'id_angajat'],
      ['ANGAJATI', 'id_manager'],
    ],
  },
] as const;

// ---- Geometry --------------------------------------------------------------

export const TABLE_WIDTH = 236;
export const HEADER = 46;
export const ROW = 34;

export const rowsOf = (table: Table) => table.fields.length + (table.more > 0 ? 1 : 0);
export const heightOf = (table: Table) => HEADER + rowsOf(table) * ROW;

const tableById = new Map(TABLES.map((table) => [table.id, table]));

/** Vertical centre of a field's row, in drawing units. */
export function rowY(tableId: string, field: string): number {
  const table = tableById.get(tableId)!;
  const index = table.fields.findIndex((f) => f.name === field);
  return table.y + HEADER + index * ROW + ROW / 2;
}

/**
 * A relationship as a curve leaving one row and arriving at another, the way
 * drawDB draws them. Tables stacked in the same column are joined by a loop
 * out to the side instead, so the line never runs through a table.
 */
export function pathOf(relation: Relation): string {
  const from = tableById.get(relation.from.table)!;
  const to = tableById.get(relation.to.table)!;
  const y1 = rowY(from.id, relation.from.field);
  const y2 = rowY(to.id, relation.to.field);

  if (from.id === to.id) {
    // The self-reference loops out on the left.
    const x = from.x;
    return `M${x},${y1} C${x - 72},${y1} ${x - 72},${y2} ${x},${y2}`;
  }

  if (from.x === to.x) {
    // Same column: loop out on the right.
    const x = from.x + TABLE_WIDTH;
    return `M${x},${y1} C${x + 84},${y1} ${x + 84},${y2} ${x},${y2}`;
  }

  const rightward = to.x > from.x;
  const x1 = rightward ? from.x + TABLE_WIDTH : from.x;
  const x2 = rightward ? to.x : to.x + TABLE_WIDTH;
  const bend = Math.max(48, Math.abs(x2 - x1) / 2);
  const c1 = rightward ? x1 + bend : x1 - bend;
  const c2 = rightward ? x2 - bend : x2 + bend;
  return `M${x1},${y1} C${c1},${y1} ${c2},${y2} ${x2},${y2}`;
}

/** The drawing's box, with room for the loops on either side. */
export const VIEWBOX = { x: -96, y: -8, width: 1632 + TABLE_WIDTH + 96 + 112, height: 0 };
VIEWBOX.height = Math.max(...TABLES.map((t) => t.y + heightOf(t))) + 16;
