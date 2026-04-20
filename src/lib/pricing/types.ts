export type Matrix = {
  widths: number[];
  heights: number[];
  /** matrix[i][j] = valor en heights[i] × widths[j]. null si la celda está vacía. */
  matrix: (number | null)[][];
};

export type PricingMatrices = {
  lineal: Matrix | null;
  realista: Matrix | null;
};

export type HoursMatrices = {
  lineal: Matrix | null;
  realista: Matrix | null;
};

export type TattooEstimate = {
  price: number;
  hours: number;
  /** true si el valor vino de la matriz del Sheet. false = fallback formula. */
  fromMatrix: boolean;
};
