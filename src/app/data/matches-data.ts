export interface Team {
  id: string;
  name: string;
  logo: string;
}

export interface MatchEvent {
  minute: string;
  type: 'goal' | 'substitution' | 'yellow_card' | 'red_card';
  description: string;
  teamName: string;
  player?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: 'scheduled' | 'live' | 'finished';
  time?: string;
  minute?: string;
  homeScore?: number;
  awayScore?: number;
  date: string; // ISO date string YYYY-MM-DD for filtering
  displayDate: string; // Human readable date for display
  league: string;
  leagueCountry: string;
  events?: MatchEvent[];
}

export interface League {
  id: string;
  name: string;
  country: string;
  flagUrl: string;
  matches: Match[];
}

// Helper to get dates relative to today
function getDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toLocaleDateString('es-EC', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Today and nearby dates for demo
const TODAY = getDateString(0);
const YESTERDAY = getDateString(-1);
const TOMORROW = getDateString(1);
const IN_2_DAYS = getDateString(2);

const TODAY_DISPLAY = formatDisplayDate(0);
const YESTERDAY_DISPLAY = formatDisplayDate(-1);
const TOMORROW_DISPLAY = formatDisplayDate(1);
const IN_2_DAYS_DISPLAY = formatDisplayDate(2);

export const MATCHES_DATA: League[] = [
  {
    id: 'pl',
    name: 'Premier League',
    country: 'England',
    flagUrl: 'https://flagcdn.com/w40/gb-eng.png',
    matches: [
      // Today's matches
      {
        id: 'pl-1',
        homeTeam: { id: 't14', name: 'Nottingham Forest', logo: 'https://api.sofascore.app/api/v1/team/14/image' },
        awayTeam: { id: 't8', name: 'Leeds United', logo: 'https://api.sofascore.app/api/v1/team/8/image' },
        status: 'scheduled',
        time: '15:00',
        date: TODAY,
        displayDate: TODAY_DISPLAY,
        league: 'Premier League',
        leagueCountry: 'England'
      },
      {
        id: 'pl-2',
        homeTeam: { id: 't7', name: 'Crystal Palace', logo: 'https://api.sofascore.app/api/v1/team/7/image' },
        awayTeam: { id: 't30', name: 'Brighton', logo: 'https://api.sofascore.app/api/v1/team/30/image' },
        status: 'live',
        homeScore: 1,
        awayScore: 0,
        minute: '34',
        date: TODAY,
        displayDate: TODAY_DISPLAY,
        league: 'Premier League',
        leagueCountry: 'England',
        events: [
          { minute: "23'", type: 'goal', description: 'Jean-Philippe Mateta opens the scoring', teamName: 'Crystal Palace', player: 'Jean-Philippe Mateta' },
        ]
      },
      {
        id: 'pl-3',
        homeTeam: { id: 't3203', name: 'Brentford', logo: 'https://api.sofascore.app/api/v1/team/3203/image' },
        awayTeam: { id: 't39', name: 'Newcastle', logo: 'https://api.sofascore.app/api/v1/team/39/image' },
        status: 'live',
        homeScore: 1,
        awayScore: 2,
        minute: '67',
        date: TODAY,
        displayDate: TODAY_DISPLAY,
        league: 'Premier League',
        leagueCountry: 'England',
        events: [
          { minute: "12'", type: 'goal', description: 'Alexander Isak scores from close range', teamName: 'Newcastle', player: 'Alexander Isak' },
          { minute: "34'", type: 'yellow_card', description: 'Bryan Mbeumo is shown the yellow card', teamName: 'Brentford', player: 'Bryan Mbeumo' },
          { minute: "45'", type: 'goal', description: 'Ivan Toney converts the penalty', teamName: 'Brentford', player: 'Ivan Toney' },
          { minute: "58'", type: 'goal', description: 'Bruno Guimarães scores from outside the box', teamName: 'Newcastle', player: 'Bruno Guimarães' },
        ]
      },
      // Yesterday's matches
      {
        id: 'pl-4',
        homeTeam: { id: 't17', name: 'Manchester City', logo: 'https://api.sofascore.app/api/v1/team/17/image' },
        awayTeam: { id: 't44', name: 'Liverpool', logo: 'https://api.sofascore.app/api/v1/team/44/image' },
        status: 'finished',
        homeScore: 3,
        awayScore: 0,
        date: YESTERDAY,
        displayDate: YESTERDAY_DISPLAY,
        league: 'Premier League',
        leagueCountry: 'England',
        events: [
          { minute: "23'", type: 'goal', description: 'Erling Haaland opens the scoring', teamName: 'Manchester City', player: 'Erling Haaland' },
          { minute: "41'", type: 'yellow_card', description: 'Virgil van Dijk is shown the yellow card', teamName: 'Liverpool', player: 'Virgil van Dijk' },
          { minute: "56'", type: 'goal', description: 'Kevin De Bruyne doubles the lead', teamName: 'Manchester City', player: 'Kevin De Bruyne' },
          { minute: "78'", type: 'substitution', description: 'Phil Foden replaces Jack Grealish', teamName: 'Manchester City' },
          { minute: "82'", type: 'goal', description: 'Erling Haaland completes his brace', teamName: 'Manchester City', player: 'Erling Haaland' },
        ]
      },
      {
        id: 'pl-5',
        homeTeam: { id: 't42', name: 'Arsenal', logo: 'https://api.sofascore.app/api/v1/team/42/image' },
        awayTeam: { id: 't35', name: 'Manchester United', logo: 'https://api.sofascore.app/api/v1/team/35/image' },
        status: 'finished',
        homeScore: 3,
        awayScore: 2,
        date: YESTERDAY,
        displayDate: YESTERDAY_DISPLAY,
        league: 'Premier League',
        leagueCountry: 'England',
        events: [
          { minute: "27'", type: 'goal', description: 'Marcus Rashford scores on the counter', teamName: 'Manchester United', player: 'Marcus Rashford' },
          { minute: "58'", type: 'goal', description: 'Martin Ødegaard scores from outside the box', teamName: 'Arsenal', player: 'Martin Ødegaard' },
          { minute: "65'", type: 'yellow_card', description: 'Lisandro Martínez is shown the yellow card', teamName: 'Manchester United', player: 'Lisandro Martínez' },
          { minute: "72'", type: 'goal', description: 'Gabriel Jesus equalizes', teamName: 'Arsenal', player: 'Gabriel Jesus' },
          { minute: "84'", type: 'substitution', description: 'Jonny Evans replaces V. Lindelöf', teamName: 'Manchester United' },
          { minute: "88'", type: 'goal', description: 'Bruno Fernandes scores from the spot', teamName: 'Manchester United', player: 'Bruno Fernandes' },
          { minute: "90'+2'", type: 'goal', description: 'Declan Rice scores from a header', teamName: 'Arsenal', player: 'Declan Rice' },
        ]
      },
      // Tomorrow's matches
      {
        id: 'pl-6',
        homeTeam: { id: 't31', name: 'Chelsea', logo: 'https://api.sofascore.app/api/v1/team/38/image' },
        awayTeam: { id: 't33', name: 'Tottenham', logo: 'https://api.sofascore.app/api/v1/team/33/image' },
        status: 'scheduled',
        time: '17:30',
        date: TOMORROW,
        displayDate: TOMORROW_DISPLAY,
        league: 'Premier League',
        leagueCountry: 'England'
      },
      {
        id: 'pl-7',
        homeTeam: { id: 't40', name: 'Everton', logo: 'https://api.sofascore.app/api/v1/team/48/image' },
        awayTeam: { id: 't36', name: 'West Ham', logo: 'https://api.sofascore.app/api/v1/team/37/image' },
        status: 'scheduled',
        time: '15:00',
        date: TOMORROW,
        displayDate: TOMORROW_DISPLAY,
        league: 'Premier League',
        leagueCountry: 'England'
      }
    ]
  },
  {
    id: 'laliga',
    name: 'La Liga',
    country: 'Spain',
    flagUrl: 'https://flagcdn.com/w40/es.png',
    matches: [
      // Today's matches
      {
        id: 'll-1',
        homeTeam: { id: 't2828', name: 'Valencia', logo: 'https://api.sofascore.app/api/v1/team/2828/image' },
        awayTeam: { id: 't2816', name: 'Real Betis', logo: 'https://api.sofascore.app/api/v1/team/2816/image' },
        status: 'finished',
        homeScore: 1,
        awayScore: 1,
        date: TODAY,
        displayDate: TODAY_DISPLAY,
        league: 'La Liga',
        leagueCountry: 'Spain',
        events: [
          { minute: "33'", type: 'goal', description: 'Hugo Duro scores for Valencia', teamName: 'Valencia', player: 'Hugo Duro' },
          { minute: "67'", type: 'goal', description: 'Isco equalizes for Betis', teamName: 'Real Betis', player: 'Isco' },
        ]
      },
      {
        id: 'll-2',
        homeTeam: { id: 't2821', name: 'Celta de Vigo', logo: 'https://api.sofascore.app/api/v1/team/2821/image' },
        awayTeam: { id: 't2817', name: 'Barcelona', logo: 'https://api.sofascore.app/api/v1/team/2817/image' },
        status: 'live',
        homeScore: 1,
        awayScore: 1,
        minute: '15',
        date: TODAY,
        displayDate: TODAY_DISPLAY,
        league: 'La Liga',
        leagueCountry: 'Spain',
        events: [
          { minute: "8'", type: 'goal', description: 'Lamine Yamal scores early', teamName: 'Barcelona', player: 'Lamine Yamal' },
          { minute: "14'", type: 'goal', description: 'Iago Aspas equalizes', teamName: 'Celta de Vigo', player: 'Iago Aspas' },
        ]
      },
      // Tomorrow's matches
      {
        id: 'll-3',
        homeTeam: { id: 't2829', name: 'Real Madrid', logo: 'https://api.sofascore.app/api/v1/team/2829/image' },
        awayTeam: { id: 't2820', name: 'Atlético Madrid', logo: 'https://api.sofascore.app/api/v1/team/2836/image' },
        status: 'scheduled',
        time: '21:00',
        date: TOMORROW,
        displayDate: TOMORROW_DISPLAY,
        league: 'La Liga',
        leagueCountry: 'Spain'
      }
    ]
  },
  {
    id: 'seriea',
    name: 'Serie A',
    country: 'Italy',
    flagUrl: 'https://flagcdn.com/w40/it.png',
    matches: [
      // In 2 days
      {
        id: 'sa-1',
        homeTeam: { id: 't2687', name: 'Juventus', logo: 'https://api.sofascore.app/api/v1/team/2687/image' },
        awayTeam: { id: 't2697', name: 'Inter Milan', logo: 'https://api.sofascore.app/api/v1/team/2697/image' },
        status: 'scheduled',
        time: '20:45',
        date: IN_2_DAYS,
        displayDate: IN_2_DAYS_DISPLAY,
        league: 'Serie A',
        leagueCountry: 'Italy'
      },
      {
        id: 'sa-2',
        homeTeam: { id: 't2692', name: 'AC Milan', logo: 'https://api.sofascore.app/api/v1/team/2692/image' },
        awayTeam: { id: 't2686', name: 'Napoli', logo: 'https://api.sofascore.app/api/v1/team/2714/image' },
        status: 'scheduled',
        time: '18:00',
        date: IN_2_DAYS,
        displayDate: IN_2_DAYS_DISPLAY,
        league: 'Serie A',
        leagueCountry: 'Italy'
      }
    ]
  }
];

// Helper function to find a match by ID
export function findMatchById(matchId: string): Match | undefined {
  for (const league of MATCHES_DATA) {
    const match = league.matches.find(m => m.id === matchId);
    if (match) {
      return match;
    }
  }
  return undefined;
}

