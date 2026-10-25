export interface CalendarDay {
  number: number;
  dateStr: string;
  svgFile: string;
  isAvailable: boolean;
  month: "NOVEMBRO" | "DEZEMBRO";
}

export const WEEKDAYS = [
  { id: "dom", label: "DOM", svg: "/natal/dobra2/calendario/SOM.svg", width: 45.0, height: 13.9815 },
  { id: "seg", label: "SEG", svg: "/natal/dobra2/calendario/SEG.svg", width: 38.257, height: 14.2097 },
  { id: "ter", label: "TER", svg: "/natal/dobra2/calendario/TER.svg", width: 39.2479, height: 14.0381 },
  { id: "qua", label: "QUA", svg: "/natal/dobra2/calendario/QUAR.svg", width: 41.8517, height: 17.4478 },
  { id: "qui", label: "QUI", svg: "/natal/dobra2/calendario/QUI.svg", width: 34.1361, height: 17.4478 },
  { id: "sex", label: "SEX", svg: "/natal/dobra2/calendario/SEX.svg", width: 37.1143, height: 15.0667 },
  { id: "sab", label: "SAB", svg: "/natal/dobra2/calendario/SAB.svg", width: 38.8467, height: 14.1908 },
];

/**
 * Matriz exata de 5 semanas do calendário (Ano 2026):
 * - Linha 1 (Novembro): 08 a 14/11
 * - Linha 2 (Novembro): 15 a 21/11
 * - Linha 3 (Novembro): 22 a 28/11
 * - Linha 4 (Dezembro): 29/11 a 05/12
 * - Linha 5 (Dezembro): 06 a 12/12
 */
export const CALENDAR_ROWS: {
  month: "NOVEMBRO" | "DEZEMBRO";
  showTab?: boolean;
  days: CalendarDay[];
}[] = [
  {
    month: "NOVEMBRO",
    showTab: true,
    days: [
      { number: 8, dateStr: "2026-11-08", svgFile: "08.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 9, dateStr: "2026-11-09", svgFile: "09.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 10, dateStr: "2026-11-10", svgFile: "10.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 11, dateStr: "2026-11-11", svgFile: "11.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 12, dateStr: "2026-11-12", svgFile: "12.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 13, dateStr: "2026-11-13", svgFile: "13.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 14, dateStr: "2026-11-14", svgFile: "14.svg", isAvailable: true, month: "NOVEMBRO" },
    ],
  },
  {
    month: "NOVEMBRO",
    days: [
      { number: 15, dateStr: "2026-11-15", svgFile: "15.svg", isAvailable: true, month: "NOVEMBRO" },
      { number: 16, dateStr: "2026-11-16", svgFile: "16.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 17, dateStr: "2026-11-17", svgFile: "17.svg", isAvailable: true, month: "NOVEMBRO" },
      { number: 18, dateStr: "2026-11-18", svgFile: "18.svg", isAvailable: true, month: "NOVEMBRO" },
      { number: 19, dateStr: "2026-11-19", svgFile: "19.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 20, dateStr: "2026-11-20", svgFile: "20.svg", isAvailable: true, month: "NOVEMBRO" },
      { number: 21, dateStr: "2026-11-21", svgFile: "21.svg", isAvailable: true, month: "NOVEMBRO" },
    ],
  },
  {
    month: "NOVEMBRO",
    days: [
      { number: 22, dateStr: "2026-11-22", svgFile: "22.svg", isAvailable: true, month: "NOVEMBRO" },
      { number: 23, dateStr: "2026-11-23", svgFile: "23.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 24, dateStr: "2026-11-24", svgFile: "24.svg", isAvailable: true, month: "NOVEMBRO" },
      { number: 25, dateStr: "2026-11-25", svgFile: "25.svg", isAvailable: true, month: "NOVEMBRO" },
      { number: 26, dateStr: "2026-11-26", svgFile: "26.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 27, dateStr: "2026-11-27", svgFile: "27.svg", isAvailable: true, month: "NOVEMBRO" },
      { number: 28, dateStr: "2026-11-28", svgFile: "28.svg", isAvailable: true, month: "NOVEMBRO" },
    ],
  },
  {
    month: "DEZEMBRO",
    showTab: true,
    days: [
      { number: 29, dateStr: "2026-11-29", svgFile: "29.svg", isAvailable: true, month: "NOVEMBRO" },
      { number: 30, dateStr: "2026-11-30", svgFile: "30.svg", isAvailable: false, month: "NOVEMBRO" },
      { number: 1, dateStr: "2026-12-01", svgFile: "01.svg", isAvailable: true, month: "DEZEMBRO" },
      { number: 2, dateStr: "2026-12-02", svgFile: "02.svg", isAvailable: true, month: "DEZEMBRO" },
      { number: 3, dateStr: "2026-12-03", svgFile: "03.svg", isAvailable: false, month: "DEZEMBRO" },
      { number: 4, dateStr: "2026-12-04", svgFile: "04.svg", isAvailable: true, month: "DEZEMBRO" },
      { number: 5, dateStr: "2026-12-05", svgFile: "05.svg", isAvailable: true, month: "DEZEMBRO" },
    ],
  },
  {
    month: "DEZEMBRO",
    days: [
      { number: 6, dateStr: "2026-12-06", svgFile: "06.svg", isAvailable: true, month: "DEZEMBRO" },
      { number: 7, dateStr: "2026-12-07", svgFile: "07.svg", isAvailable: false, month: "DEZEMBRO" },
      { number: 8, dateStr: "2026-12-08", svgFile: "08.svg", isAvailable: true, month: "DEZEMBRO" },
      { number: 9, dateStr: "2026-12-09", svgFile: "09.svg", isAvailable: true, month: "DEZEMBRO" },
      { number: 10, dateStr: "2026-12-10", svgFile: "10.svg", isAvailable: false, month: "DEZEMBRO" },
      { number: 11, dateStr: "2026-12-11", svgFile: "11.svg", isAvailable: true, month: "DEZEMBRO" },
      { number: 12, dateStr: "2026-12-12", svgFile: "12.svg", isAvailable: true, month: "DEZEMBRO" },
    ],
  },
];
