/**
 * Supported sports in IcePlay
 */
export type Sport = 'football' | 'basketball' | 'volleyball';

/**
 * Sport configuration defining rules, positions, and event types
 */
export interface SportConfig {
  sport: Sport;
  label: string;
  labelPlural: string;
  icon: string;
  periods: number;
  periodDuration?: number; // In minutes (football: 45, basketball: 10)
  periodLabel: string;
  periodLabelPlural: string;
  positions: PositionConfig[];
  eventTypes: EventTypeConfig[];
  scoringRules: ScoringRules;
  matchRules: MatchRules;
}

export interface PositionConfig {
  code: string;
  label: string;
  abbreviation: string;
}

export interface EventTypeConfig {
  code: string;
  label: string;
  icon: string;
  color: string;
  affectsScore: boolean;
  pointValue?: number;
  category: 'scoring' | 'card' | 'substitution' | 'other';
}

export interface ScoringRules {
  pointsPerGoal?: number; // Football: 1
  pointValues?: number[]; // Basketball: [1, 2, 3]
  setsToWin?: number; // Volleyball: 3
  pointsToWinSet?: number; // Volleyball: 25
  pointsToWinTiebreak?: number; // Volleyball: 15
}

export interface MatchRules {
  playersOnField: number;
  substitutionsAllowed: number;
  maxYellowCards?: number;
  maxFouls?: number;
}

/**
 * Predefined sport configurations
 */
export const SPORT_CONFIGS: Record<Sport, SportConfig> = {
  football: {
    sport: 'football',
    label: 'Fútbol',
    labelPlural: 'Partidos de Fútbol',
    icon: 'sports_soccer',
    periods: 2,
    periodDuration: 45,
    periodLabel: 'Tiempo',
    periodLabelPlural: 'Tiempos',
    positions: [
      { code: 'GK', label: 'Portero', abbreviation: 'POR' },
      { code: 'DEF', label: 'Defensa', abbreviation: 'DEF' },
      { code: 'MID', label: 'Mediocampista', abbreviation: 'MED' },
      { code: 'FWD', label: 'Delantero', abbreviation: 'DEL' },
    ],
    eventTypes: [
      {
        code: 'goal',
        label: 'Gol',
        icon: 'sports_soccer',
        color: '#4ade80',
        affectsScore: true,
        pointValue: 1,
        category: 'scoring',
      },
      {
        code: 'own_goal',
        label: 'Autogol',
        icon: 'sports_soccer',
        color: '#f87171',
        affectsScore: true,
        pointValue: 1,
        category: 'scoring',
      },
      {
        code: 'penalty_scored',
        label: 'Penal Anotado',
        icon: 'sports_soccer',
        color: '#4ade80',
        affectsScore: true,
        pointValue: 1,
        category: 'scoring',
      },
      {
        code: 'penalty_missed',
        label: 'Penal Fallado',
        icon: 'close',
        color: '#f87171',
        affectsScore: false,
        category: 'scoring',
      },
      {
        code: 'assist',
        label: 'Asistencia',
        icon: 'sync_alt',
        color: '#60a5fa',
        affectsScore: false,
        category: 'other',
      },
      {
        code: 'yellow_card',
        label: 'Tarjeta Amarilla',
        icon: 'square',
        color: '#facc15',
        affectsScore: false,
        category: 'card',
      },
      {
        code: 'red_card',
        label: 'Tarjeta Roja',
        icon: 'square',
        color: '#ef4444',
        affectsScore: false,
        category: 'card',
      },
      {
        code: 'second_yellow',
        label: 'Segunda Amarilla',
        icon: 'square',
        color: '#f97316',
        affectsScore: false,
        category: 'card',
      },
      {
        code: 'substitution_in',
        label: 'Entra',
        icon: 'arrow_upward',
        color: '#22c55e',
        affectsScore: false,
        category: 'substitution',
      },
      {
        code: 'substitution_out',
        label: 'Sale',
        icon: 'arrow_downward',
        color: '#ef4444',
        affectsScore: false,
        category: 'substitution',
      },
    ],
    scoringRules: { pointsPerGoal: 1 },
    matchRules: { playersOnField: 11, substitutionsAllowed: 5, maxYellowCards: 2 },
  },

  basketball: {
    sport: 'basketball',
    label: 'Baloncesto',
    labelPlural: 'Partidos de Baloncesto',
    icon: 'sports_basketball',
    periods: 4,
    periodDuration: 10,
    periodLabel: 'Cuarto',
    periodLabelPlural: 'Cuartos',
    positions: [
      { code: 'PG', label: 'Base', abbreviation: 'PG' },
      { code: 'SG', label: 'Escolta', abbreviation: 'SG' },
      { code: 'SF', label: 'Alero', abbreviation: 'SF' },
      { code: 'PF', label: 'Ala-Pívot', abbreviation: 'PF' },
      { code: 'C', label: 'Pívot', abbreviation: 'C' },
    ],
    eventTypes: [
      {
        code: 'free_throw',
        label: 'Tiro Libre',
        icon: 'sports_basketball',
        color: '#4ade80',
        affectsScore: true,
        pointValue: 1,
        category: 'scoring',
      },
      {
        code: 'two_pointer',
        label: '2 Puntos',
        icon: 'sports_basketball',
        color: '#60a5fa',
        affectsScore: true,
        pointValue: 2,
        category: 'scoring',
      },
      {
        code: 'three_pointer',
        label: '3 Puntos',
        icon: 'sports_basketball',
        color: '#a78bfa',
        affectsScore: true,
        pointValue: 3,
        category: 'scoring',
      },
      {
        code: 'assist',
        label: 'Asistencia',
        icon: 'sync_alt',
        color: '#60a5fa',
        affectsScore: false,
        category: 'other',
      },
      {
        code: 'rebound',
        label: 'Rebote',
        icon: 'sync',
        color: '#22c55e',
        affectsScore: false,
        category: 'other',
      },
      {
        code: 'steal',
        label: 'Robo',
        icon: 'swipe',
        color: '#f59e0b',
        affectsScore: false,
        category: 'other',
      },
      {
        code: 'block',
        label: 'Bloqueo',
        icon: 'pan_tool',
        color: '#8b5cf6',
        affectsScore: false,
        category: 'other',
      },
      {
        code: 'turnover',
        label: 'Pérdida',
        icon: 'close',
        color: '#ef4444',
        affectsScore: false,
        category: 'other',
      },
      {
        code: 'foul',
        label: 'Falta Personal',
        icon: 'front_hand',
        color: '#f97316',
        affectsScore: false,
        category: 'card',
      },
      {
        code: 'technical_foul',
        label: 'Falta Técnica',
        icon: 'error',
        color: '#ef4444',
        affectsScore: false,
        category: 'card',
      },
      {
        code: 'substitution_in',
        label: 'Entra',
        icon: 'arrow_upward',
        color: '#22c55e',
        affectsScore: false,
        category: 'substitution',
      },
      {
        code: 'substitution_out',
        label: 'Sale',
        icon: 'arrow_downward',
        color: '#ef4444',
        affectsScore: false,
        category: 'substitution',
      },
    ],
    scoringRules: { pointValues: [1, 2, 3] },
    matchRules: { playersOnField: 5, substitutionsAllowed: -1, maxFouls: 5 }, // -1 = unlimited
  },

  volleyball: {
    sport: 'volleyball',
    label: 'Voleibol',
    labelPlural: 'Partidos de Voleibol',
    icon: 'sports_volleyball',
    periods: 5,
    periodLabel: 'Set',
    periodLabelPlural: 'Sets',
    positions: [
      { code: 'S', label: 'Armador', abbreviation: 'ARM' },
      { code: 'OH', label: 'Atacante Exterior', abbreviation: 'AE' },
      { code: 'MB', label: 'Central', abbreviation: 'CEN' },
      { code: 'OP', label: 'Opuesto', abbreviation: 'OPU' },
      { code: 'L', label: 'Líbero', abbreviation: 'LIB' },
    ],
    eventTypes: [
      {
        code: 'point',
        label: 'Punto',
        icon: 'sports_volleyball',
        color: '#4ade80',
        affectsScore: true,
        pointValue: 1,
        category: 'scoring',
      },
      {
        code: 'ace',
        label: 'Ace',
        icon: 'bolt',
        color: '#60a5fa',
        affectsScore: true,
        pointValue: 1,
        category: 'scoring',
      },
      {
        code: 'block_point',
        label: 'Punto de Bloqueo',
        icon: 'pan_tool',
        color: '#a78bfa',
        affectsScore: true,
        pointValue: 1,
        category: 'scoring',
      },
      {
        code: 'kill',
        label: 'Ataque Exitoso',
        icon: 'flash_on',
        color: '#f59e0b',
        affectsScore: true,
        pointValue: 1,
        category: 'scoring',
      },
      {
        code: 'error',
        label: 'Error',
        icon: 'close',
        color: '#ef4444',
        affectsScore: false,
        category: 'other',
      },
      {
        code: 'dig',
        label: 'Defensa',
        icon: 'sports_volleyball',
        color: '#22c55e',
        affectsScore: false,
        category: 'other',
      },
      {
        code: 'substitution_in',
        label: 'Entra',
        icon: 'arrow_upward',
        color: '#22c55e',
        affectsScore: false,
        category: 'substitution',
      },
      {
        code: 'substitution_out',
        label: 'Sale',
        icon: 'arrow_downward',
        color: '#ef4444',
        affectsScore: false,
        category: 'substitution',
      },
      {
        code: 'timeout',
        label: 'Tiempo Muerto',
        icon: 'timer',
        color: '#6b7280',
        affectsScore: false,
        category: 'other',
      },
    ],
    scoringRules: { setsToWin: 3, pointsToWinSet: 25, pointsToWinTiebreak: 15 },
    matchRules: { playersOnField: 6, substitutionsAllowed: 6 },
  },
};

/**
 * Get sport configuration by sport type
 */
export function getSportConfig(sport: Sport): SportConfig {
  return SPORT_CONFIGS[sport];
}

/**
 * Get all available sports as array
 */
export function getAvailableSports(): { sport: Sport; label: string; icon: string }[] {
  return Object.values(SPORT_CONFIGS).map(({ sport, label, icon }) => ({
    sport,
    label,
    icon,
  }));
}

