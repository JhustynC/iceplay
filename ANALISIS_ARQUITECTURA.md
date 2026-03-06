# Análisis de Arquitectura - IcePlay

**Fecha:** 5 de marzo de 2026  
**Proyecto:** IcePlay - Plataforma de Gestión Deportiva  
**Proposito:** Documentar entidades, relaciones y flujos de datos en la aplicación

---

## 📋 Tabla de Contenidos

1. [Arquitectura de Entidades](#arquitectura-de-entidades)
2. [Relaciones entre Entidades](#relaciones-entre-entidades)
3. [Servicios del Frontend](#servicios-del-frontend)
4. [Flujos por Pantalla](#flujos-por-pantalla)
5. [Endpoints Necesarios en Backend](#endpoints-necesarios-en-backend)
6. [Matriz de Dependencias](#matriz-de-dependencias)

---

## 🏗️ Arquitectura de Entidades

### 1. **User** (Usuario)

```typescript
Interface Principal:
├── id: string
├── email: string
├── firstName: string
├── lastName: string
├── role: 'super_admin' | 'admin'
├── organizationId?: string (solo para admin) // no se pensaba esto para futuro??
├── avatar?: string
├── phone?: string
├── createdAt: Date
├── lastLoginAt?: Date
├── isActive: boolean
└── token?: string (para autenticación)
```

**Descripción:** Representa a los usuarios del sistema (administradores y super administradores)  
**Responsabilidades:**

- Gestionar acceso a la plataforma
- Vincular admins con organizaciones
- Controlar permisos según el rol

---

### 2. **Organization** (Organización/Liga)

```typescript
Interface Principal:
├── id: string
├── name: string
├── slug: string // entiendo que sirve para hacer lo endpoints ???
├── description?: string
├── logo?: string // es necesario tener un logo?
├── coverImage?: string
├── contactEmail: string
├── contactPhone?: string
├── address?: string
├── city?: string
├── country: string
├── website?: string
├── socialLinks?: OrganizationSocialLinks
├── settings: OrganizationSettings
├── createdAt: Date
├── updatedAt: Date
└── isActive: boolean

OrganizationSettings:
├── defaultSport: Sport // una organización tiene un solo deporte??
├── timezone: string
├── locale: string
├── primaryColor?: string
└── secondaryColor?: string
```

**Descripción:** Contenedor principal de la estructura deportiva (ej: Liga Quito Norte, Liga Ecuador de Voleibol)  
**Responsabilidades:**

- Agrupar campeonatos, equipos y jugadores
- Mantener configuración organizacional
- Gestionar admins de la organización

---

### 3. **Championship** (Campeonato/Torneo)

```typescript
Interface Principal:
├── id: string
├── organizationId: string
├── name: string
├── slug: string
├── description?: string
├── sport: Sport ('football' | 'basketball' | 'volleyball')
├── format: ChampionshipFormat ('league' | 'knockout' | 'group_stage' | 'mixed')
├── season: string (ej: "2024-2025") // se podría calcular??
├── status: ChampionshipStatus ('draft' | 'registration' | 'active' | 'finished' | 'cancelled')
├── logo?: string
├── coverImage?: string
├── settings: ChampionshipSettings
├── registrationStartDate?: Date
├── registrationEndDate?: Date
├── startDate: Date
├── endDate?: Date
├── totalTeams: number // es un parámetro?
├── totalMatches: number // es un parámetro?
├── matchesPlayed: number // datos que se pueden calcular
├── createdAt: Date
└── updatedAt: Date

ChampionshipSettings:
├── pointsForWin: number (default: 3) // se obtenen por ganar
├── pointsForDraw: number (default: 1) // por empatar
├── pointsForLoss: number (default: 0) // por perder
├── roundsCount: number (1 = una sola vuelta, 2 = ida y vuelta) // define el tipo de rondas
├── teamsPerGroup?: number
└── teamsAdvancePerGroup?: number
```

**Descripción:** Liga/Torneo específico (ej: Liga Nacional 2024-2025, Copa Ecuador)  
**Responsabilidades:**

- Define reglas de competencia
- Agrupa equipos y partidos
- Calcula tabla de posiciones

---

### 4. **Team** (Equipo)

```typescript
Interface Principal:
├── id: string
├── championshipId: string
├── organizationId: string (desnormalizado)
├── name: string
├── shortName: string (ej: "FCB", "RMA")
├── slug: string
├── logo?: string
├── coverImage?: string
├── primaryColor: string
├── secondaryColor: string
├── foundedYear?: number // es necesario??
├── homeVenue?: string // es necesario??
├── city?: string // es necesario??
├── managerName?: string
├── managerPhone?: string
├── managerEmail?: string
├── isActive: boolean // permite usar al equipo
├── hasActiveMatches: boolean
├── playersCount: number (desnormalizado) // se pude calcular
├── createdAt: Date
└── updatedAt: Date
```

**Descripción:** Equipo deportivo que participa en un campeonato  
**Responsabilidades:**

- Contener jugadores
- Participar en partidos
- Tener estadísticas y clasificación

---

### 5. **Player** (Jugador)

```typescript
// andrés propuso que se puedo ingresar una lista(excel, csv) con el fin de no ingresar manualmente
// también que el coach o el lider del equipo pueda ingresar a todo el equipo.
// meta es que se registren los equipos sin la presencias del administrador(solo en los registros)
Interface Principal:
├── id: string
├── teamId: string
├── championshipId: string (desnormalizado)
├── organizationId: string (desnormalizado)
├── firstName: string
├── lastName: string
├── fullName: string (computed)
├── nickname?: string // es lo que está en el dorsal??
├── number: number
├── position: string
├── secondaryPosition?: string
├── document?: string (cédula, DNI, certificado de la luz) // como forma de indentificar de donde procede el jugador, arrays de urls de datos subidos, como se gestionan los documentos del jugador
├── birthDate?: Date
├── age?: number (computed)
├── nationality?: string // es necesario??
├── height?: number (en cm) // es necesario??
├── weight?: number (en kg) // es necesario??
├── photo?: string // nombre de la foto?
├── status: PlayerStatus ('active' | 'injured' | 'suspended' | 'inactive')
├── suspensionEndDate?: Date // es necesario??
├── suspensionReason?: string  // es necesario??
├── stats: PlayerStats // estadísticas del jugador
├── createdAt: Date
└── updatedAt: Date

PlayerStats:
├── matchesPlayed: number
├── minutesPlayed: number
├── goals?: number
├── assists?: number
├── cards?: {yellow: number, red: number}
└── [otros según deporte]
```

**Descripción:** Atleta que forma parte de un equipo  
**Responsabilidades:**

- Participar en partidos
- Registrar eventos (goles, tarjetas, etc)
- Mantener estadísticas

---

### 6. **Match** (Partido)

```typescript

Interface Principal:
├── id: string
├── championshipId: string
├── organizationId: string (desnormalizado)
├── homeTeamId: string
├── awayTeamId: string
├── homeTeam?: TeamBasicInfo (populated) // que datos tiene??
├── awayTeam?: TeamBasicInfo (populated) // que datos tiene??
├── homeScore: number
├── awayScore: number
├── status: MatchStatus (scheduled|warmup|live|halftime|break|overtime|penalties|finished|suspended|postponed|cancelled) // no es en tiempo real, se necesita recargar para ver el estado del partido(websoked o colas en el futuro)
├── round: number // que es?
├── matchday: number // que es?
├── group?: string (para group stage: "A", "B")
├── stage?: string (group_stage, quarterfinals, etc)
├── scheduledDate: Date
├── scheduledTime: string (ej: "15:00")
├── actualStartTime?: Date
├── actualEndTime?: Date
├── venue?: string
├── city?: string
├── createdAt: Date
└── updatedAt: Date
```

**Descripción:** Evento deportivo entre dos equipos  
**Responsabilidades:**

- Almacenar resultado del encuentro
- Registrar eventos del partido
- Actualizar tabla de posiciones

---

### 7. **MatchEvent** (Evento del Partido)

```typescript
Interface Principal:
├── id: string
├── matchId: string
├── championshipId: string (desnormalizado)
├── type: string (código del evento según deporte) // como decir deporte
├── playerId: string
├── player?: PlayerBasicInfo (populated)
├── teamId: string
├── team?: TeamBasicInfo (populated)
├── relatedPlayerId?: string (sustituciones) // jugador más importante
├── relatedPlayer?: PlayerBasicInfo // eliminar ya que en cada jugador X se pondría al mejor jugador
├── period: number //primer segúndo tiempo
├── minute: number
├── extraMinute?: number (tiempo adicional)
├── description?: string
├── createdAt: Date
├── createdBy: string (Admin ID)
├── updatedAt?: Date
└── updatedBy?: string
```

**Descripción:** Evento individual durante un partido (gol, tarjeta, sustitución, etc)  
**Responsabilidades:**

- Registrar eventos del partido
- Permitir auditoría de cambios
- Actualizar estadísticas de jugadores

---

### 8. **Standing** (Tabla de Posiciones)

```typescript
// se puede hacer la tabla de forma dinámica según el deporte, es decir de debería armar en el back
Interface Principal:
├── id: string
├── championshipId: string
├── teamId: string
├── team?: TeamBasicInfo (populated) // ??
├── group?: string (para group stage) // ??
├── position: number
├── previousPosition?: number
├── played: number
├── won: number
├── drawn: number
├── lost: number
├── goalsFor: number
├── goalsAgainst: number
├── goalDifference: number (computed)
├── points: number
├── form: MatchResult[] (últimos 5 partidos: W|D|L)
├── setsWon?: number (voleibol)
├── setsLost?: number (voleibol)
├── setsDifference?: number (voleibol)
├── pointsRatio?: number (voleibol)
└── updatedAt: Date
```

**Descripción:** Registro de la posición de un equipo en la tabla de un campeonato  
**Responsabilidades:**

- Mostrar clasificación actualizada
- Registrar histórico de posiciones
- Calcular automáticamente según resultados

---

### 9. **Announcement** (Anuncio)

```typescript
// Tal vez sea sponsor?? o solo son notificaciones
Interface Principal:
├── id: string
├── title: string
├── content: string
├── type: AnnouncementType ('info' | 'warning' | 'success' | 'error')
├── target: AnnouncementTarget ('all' | 'organization' | 'championship')
├── organizationId?: string
├── championshipId?: string
├── isPublic: boolean
├── isPinned: boolean
├── publishDate: Date
├── expirationDate?: Date
├── createdBy: string
├── createdAt: Date
└── updatedAt?: Date
```

**Descripción:** Mensajes informativos para usuarios  
**Responsabilidades:**

- Comunicar actualizaciones
- Notificar cambios importantes
- Alcance controlado (todo el sistema, por organización, por campeonato)

---

### 10. **SportConfig** (Configuración de Deporte)

```typescript
// es otro sistema ?? ya que se debe ir anotando cada cosa
Interface Principal:
├── sport: Sport ('football' | 'basketball' | 'volleyball')
├── label: string
├── labelPlural: string
├── icon: string
├── periods: number
├── periodDuration?: number
├── periodLabel: string
├── periodLabelPlural: string
├── positions: PositionConfig[]
├── eventTypes: EventTypeConfig[]
├── scoringRules: ScoringRules
└── matchRules: MatchRules

PositionConfig:
├── code: string
├── label: string
└── abbreviation: string

EventTypeConfig:
├── code: string
├── label: string
├── icon: string
├── color: string
├── affectsScore: boolean
├── pointValue?: number
└── category: 'scoring' | 'card' | 'substitution' | 'other'

ScoringRules:
├── pointsPerGoal?: number
├── pointValues?: number[]
├── setsToWin?: number
├── pointsToWinSet?: number
└── pointsToWinTiebreak?: number
```

**Descripción:** Configuración de reglas específicas para cada deporte  
**Responsabilidades:**

- Definir posiciones válidas
- Define tipos de eventos permitidos
- Reglas de puntuación

---

## 🔗 Relaciones entre Entidades

```
┌─────────────────────────────────────────────────────────┐
│                      HIERARCHY MAP                       │
└─────────────────────────────────────────────────────────┘

System Level:
    ├── SuperAdmin (User)
    │   └── manages → Organizations
    │
Organization Level (owns everything below):
    ├── Organization
    │   ├── 1 Admin (User)
    │   ├── N Championships
    │   │   ├── Sport (config)
    │   │   ├── Format (config)
    │   │   └── Settings (config)
    │   │
    │   └── N Teams
    │       └── N Players
    │
Championship:
    ├── N Teams
    ├── N Matches
    │   ├── 2 Teams (home, away)
    │   └── N MatchEvents
    │       ├── 1 Player
    │       └── 1 Team
    │
    └── N Standings
        ├── 1 Team
        └── Form (últimos resultados)

Announcements: Global, pueden dirigirse a Organization o Championship
```

### Diagrama de Relaciones Propuestas (Database)

```
User
├─ id (PK)
├─ email (UNIQUE)
├─ organizationId (FK → Organization) [nullable]
└─ ...

Organization
├─ id (PK)
├─ name
└─ ...

Championship
├─ id (PK)
├─ organizationId (FK → Organization) [NOT NULL]
└─ ...

Team
├─ id (PK)
├─ championshipId (FK → Championship) [NOT NULL]
├─ organizationId (FK → Organization) [NOT NULL, desnormalizado]
└─ ...

Player
├─ id (PK)
├─ teamId (FK → Team) [NOT NULL]
├─ championshipId (FK → Championship) [NOT NULL, desnormalizado]
├─ organizationId (FK → Organization) [NOT NULL, desnormalizado]
└─ ...

Match
├─ id (PK)
├─ championshipId (FK → Championship) [NOT NULL]
├─ organizationId (FK → Organization) [NOT NULL, desnormalizado]
├─ homeTeamId (FK → Team) [NOT NULL]
├─ awayTeamId (FK → Team) [NOT NULL]
└─ ...

MatchEvent
├─ id (PK)
├─ matchId (FK → Match) [NOT NULL]
├─ playerId (FK → Player) [NOT NULL]
├─ teamId (FK → Team) [NOT NULL]
├─ championshipId (FK → Championship) [NOT NULL, desnormalizado]
└─ ...

Standing
├─ id (PK)
├─ championshipId (FK → Championship) [NOT NULL]
├─ teamId (FK → Team) [NOT NULL]
└─ ...

Announcement
├─ id (PK)
├─ organizationId (FK → Organization) [nullable]
└─ championshipId (FK → Championship) [nullable]
```

---

## 🔌 Servicios del Frontend

### 1. **AuthService**

**Responsabilidades:**

- Gestionar login/logout
- Mantener usuario actual en signals
- Verificar autenticación y permisos
- Controlar token JWT

**Métodos Principales:**

```typescript
login(credentials): Promise<void>
logout(): void
isAuthenticated(): boolean
isAdmin(): boolean
isSuperAdmin(): boolean
user(): User | null
token(): string | null
```

**Dependencias:** ApiService, Router

---

### 2. **ApiService**

**Responsabilidades:**

- Cliente HTTP genérico
- Base URL centralisada
- Manejo de parámetros

**Métodos Principales:**

```typescript
get<T>(path: string, params?: any): Observable<T>
post<T>(path: string, body: any): Observable<T>
put<T>(path: string, body: any): Observable<T>
patch<T>(path: string, body: any): Observable<T>
delete<T>(path: string): Observable<T>
```

**Endpoint Base:** `http://localhost:3001/api`

---

### 3. **ChampionshipService**

**Responsabilidades:**

- CRUD de campeonatos
- Filtrar por organización y estado
- Obtener campeonatos activos

**Métodos Principales:**

```typescript
getChampionships(organizationId?: string): Observable<Championship[]>
getActiveChampionships(): Observable<Championship[]>
getChampionshipById(id: string): Observable<Championship>
createChampionship(championship: Partial<Championship>): Observable<Championship>
updateChampionship(id: string, championship: Partial<Championship>): Observable<Championship>
deleteChampionship(id: string): Observable<void>
```

**Endpoints GET:**

- `GET /api/championships` - Listar campeonatos
- `GET /api/championships/all?status=1` - Campeonatos activos
- `GET /api/championships/:id` - Detalles

**Endpoints POST/PATCH/DELETE:**

- `POST /api/championships` - Crear
- `PATCH /api/championships/:id` - Actualizar
- `DELETE /api/championships/:id` - Eliminar

---

### 4. **TeamService**

**Responsabilidades:**

- CRUD de equipos
- Importación CSV de equipos
- Relacionar equipos con campeonatos

**Métodos Principales:**

```typescript
getTeams(championshipId: string): Observable<Team[]>
getTeamsByOrganization(organizationId: string): Observable<Team[]>
getTeamById(id: string): Observable<Team>
getTeamWithPlayers(id: string): Observable<TeamWithPlayers>
createTeam(team: CreateTeamDto & {championshipId: string; organizationId: string}): Observable<Team>
updateTeam(id: string, team: UpdateTeamDto): Observable<Team>
deleteTeam(id: string): Observable<void>
getPlayers(teamId: string): Observable<Player[]>
importTeamsFromCsv(file: File, championshipId: string): Observable<CsvImportResult>
```

**Endpoints GET:**

- `GET /api/teams/all?championshipId=:id` - Equipos de campeonato
- `GET /api/teams/all?organizationId=:id` - Equipos de organización
- `GET /api/teams/:id` - Detalles
- `GET /api/teams/:id/players` - Jugadores del equipo

**Endpoints POST/PATCH/DELETE:**

- `POST /api/teams` - Crear
- `PATCH /api/teams/:id` - Actualizar
- `DELETE /api/teams/:id` - Eliminar
- `POST /api/teams/import-csv` - Importar desde CSV

---

### 5. **PlayerService**

**Responsabilidades:**

- CRUD de jugadores
- Importación CSV de jugadores
- Estadísticas de jugadores

**Métodos Principales:**

```typescript
getPlayersByTeam(teamId: string): Observable<Player[]>
getPlayersByChampionship(championshipId: string): Observable<Player[]>
getPlayersByOrganization(organizationId: string): Observable<Player[]>
getPlayerById(id: string): Observable<Player>
createPlayer(player: CreatePlayerDto & {teamId: string; championshipId: string; organizationId: string}): Observable<Player>
updatePlayer(id: string, player: UpdatePlayerDto): Observable<Player>
deletePlayer(id: string): Observable<void>
importPlayersFromCsv(file: File, championshipId: string): Observable<CsvImportResult>
```

**Endpoints GET:**

- `GET /api/players?teamId=:id` - Jugadores del equipo
- `GET /api/players?championshipId=:id` - Jugadores del campeonato
- `GET /api/players?organizationId=:id` - Jugadores de organización
- `GET /api/players/:id` - Detalles

**Endpoints POST/PATCH/DELETE:**

- `POST /api/players` - Crear
- `PATCH /api/players/:id` - Actualizar
- `DELETE /api/players/:id` - Eliminar
- `POST /api/players/import-csv` - Importar desde CSV

---

### 6. **MatchService**

**Responsabilidades:**

- CRUD de partidos
- Filtrar por fecha, campeonato, equipo
- Obtener partidos en vivo

**Métodos Principales:**

```typescript
getMatches(championshipId: string): Observable<Match[]>
getMatchesByDate(date: string, championshipId?: string): Observable<Match[]>
getMatchById(id: string): Observable<Match>
getMatchesByOrganization(organizationId: string): Observable<Match[]>
getLiveMatches(organizationId?: string): Observable<Match[]>
createMatch(match: Partial<Match>): Observable<Match>
updateMatch(id: string, match: UpdateMatchDto): Observable<Match>
updateMatchScore(id: string, score: UpdateMatchScoreDto): Observable<Match>
```

**Endpoints GET:**

- `GET /api/matches/all?championshipId=:id` - Partidos del campeonato
- `GET /api/matches/all?date=YYYY-MM-DD` - Partidos por fecha
- `GET /api/matches?organizationId=:id` - Partidos de organización
- `GET /api/matches?status=live` - Partidos en vivo
- `GET /api/matches/:id` - Detalles

**Endpoints POST/PATCH/DELETE:**

- `POST /api/matches` - Crear
- `PATCH /api/matches/:id` - Actualizar
- `PATCH /api/matches/:id` - Actualizar score

---

### 7. **MatchEventService**

**Responsabilidades:**

- Registrar eventos del partido
- Polling para partidos en vivo
- Gestión de eventos en tiempo real

**Métodos Principales:**

```typescript
getMatchEvents(matchId: string): Observable<MatchEvent[]>
getMatchEventsWithPolling(matchId: string, isLive: boolean): Observable<MatchEvent[]>
createEvent(event: CreateEventDto & {matchId: string; championshipId: string}): Observable<MatchEvent>
updateEvent(id: string, event: UpdateEventDto): Observable<MatchEvent>
deleteEvent(id: string): Observable<void>
getEventById(id: string): Observable<MatchEvent>
```

**Endpoints GET:**

- `GET /api/events?matchId=:id` - Eventos del partido
- `GET /api/events/:id` - Detalles del evento

**Endpoints POST/PATCH/DELETE:**

- `POST /api/events` - Crear evento
- `PATCH /api/events/:id` - Actualizar
- `DELETE /api/events/:id` - Eliminar

**Características:**

- Polling cada 3 segundos para partidos en vivo
- Actualización de eventos en tiempo real

---

### 8. **OrganizationService**

**Responsabilidades:**

- CRUD de organizaciones
- Gestión de datos de organización

**Métodos Principales:**

```typescript
getOrganizations(): Observable<Organization[]>
getOrganizationById(id: string): Observable<Organization>
createOrganization(org: Omit<Organization, 'id'>): Observable<Organization>
updateOrganization(id: string, org: Partial<Organization>): Observable<Organization>
```

**Endpoints GET:**

- `GET /api/organizations` - Listar todas
- `GET /api/organizations/:id` - Detalles

**Endpoints POST/PATCH:**

- `POST /api/organizations` - Crear
- `PATCH /api/organizations/:id` - Actualizar

---

### 9. **Servicios Auxiliares**

- **I18nService**: Internacionalización y traducción
- **ThemeService**: Gestión de temas (dark mode)
- **SidenavService**: Control de menú lateral
- **TranslatePipe**: Pipe personalizado para traducir

---

## 📱 Flujos por Pantalla

### **MÓDULO ADMIN**

#### 1️⃣ Dashboard Admin

```
Pantalla: /admin
Servicios: AuthService, ChampionshipService, TeamService, MatchService, PlayerService

Datos Mostrados:
├── Campeonatos activos
├── Equipos registrados
├── Jugadores totales
└── Próximos partidos

Flujo:
1. Usuario loguea (AuthService)
2. Carga campeonatos (ChampionshipService.getChampionships())
3. Carga equipos (TeamService.getTeams())
4. Carga jugadores (PlayerService.getPlayersByOrganization())
5. Carga próximos partidos (MatchService.getMatches())
```

#### 2️⃣ Gestión de Campeonatos

```
Pantalla: /admin/championships, /admin/championships/:id, /admin/championships/new|edit
Servicios: ChampionshipService, AuthService

Acciones:
1. Listar campeonatos
   - ChampionshipService.getChampionships(organizationId)

2. Ver detalle (tabs: resumen, equipos, fixture, tabla)
   - ChampionshipService.getChampionshipById(id)
   - TeamService.getTeams(championshipId)
   - MatchService.getMatches(championshipId)

3. Crear/Editar campeonato
   - ChampionshipService.createChampionship(data)
   - ChampionshipService.updateChampionship(id, data)
```

#### 3️⃣ Generador de Fixture

```
Pantalla: /admin/fixtures/generate
Servicios: ChampionshipService, TeamService, MatchService

Flujo:
1. Seleccionar campeonato (ChampionshipService.getChampionships())
2. Obtener equipos (TeamService.getTeams(championshipId))
3. Generar calendario automático
4. Crear partidos uno a uno
   - for each match: MatchService.createMatch(matchData)
5. Mostrar resultados generados
```

#### 4️⃣ Control en Vivo de Partidos

```
Pantalla: /admin/match-control/:matchId
Servicios: MatchService, MatchEventService, TeamService, PlayerService, ChampionshipService

Estado del Partido:
├── Match (score, estado, equipos)
├── Players de ambos equipos
├── Eventos registrados (en vivo)
└── Controles para cambiar estado

Acciones:
1. Cargar partido (MatchService.getMatchById(matchId))
2. Cargar equipo home (TeamService.getTeamById(homeTeamId))
3. Cargar equipo away (TeamService.getTeamById(awayTeamId))
4. Cargar jugadores (PlayerService.getPlayersByTeam())
5. Cargar configuración del deporte (para tipos de eventos)
6. Registrar evento (MatchEventService.createEvent())
7. Actualizar score (MatchService.updateMatchScore())
8. Actualizar estado (MatchService.updateMatch())

Polling en Vivo:
- MatchEventService.getMatchEventsWithPolling(matchId, true)
- Actualiza cada 3 segundos si el partido está en vivo
```

#### 5️⃣ Gestión de Equipos

```
Pantalla: /admin/teams, /admin/teams/:id, /admin/teams/new|edit
Servicios: TeamService, ChampionshipService, PlayerService

Acciones:
1. Listar equipos (TeamService.getTeams(championshipId))
2. Ver detalles del equipo
   - TeamService.getTeamWithPlayers(teamId)
   - MatchService.getMatches() filtered by team
3. Crear equipo (TeamService.createTeam(data))
4. Editar equipo (TeamService.updateTeam(id, data))
5. Importar equipos desde CSV (TeamService.importTeamsFromCsv(file))
```

#### 6️⃣ Gestión de Jugadores

```
Pantalla: /admin/players, /admin/players/new|edit
Servicios: PlayerService, TeamService, ChampionshipService

Acciones:
1. Listar jugadores (PlayerService.getPlayersByChampionship())
2. Crear jugador (PlayerService.createPlayer(data))
3. Editar jugador (PlayerService.updatePlayer(id, data))
4. Importar CSV (PlayerService.importPlayersFromCsv(file))
5. Ver estadísticas (derivadas de MatchEvents)
```

#### 7️⃣ Tabla de Posiciones

```
Pantalla: /admin/standings
Servicios: ChampionshipService, MatchService, TeamService

Flujo:
1. Cargar campeonato (ChampionshipService.getChampionshipById(id))
2. Obtener tabla de posiciones (de MatchEvents y Matches calculados)
3. Mostrar equipos ordenados por puntos
4. Mostrar forma (últimos 5 partidos)

Cálculo automático:
- Back debe calcular/actualizar Standing después de cada MatchEvent
```

---

### **MÓDULO MATCHES (Público)**

#### 8️⃣ Listado Público de Partidos

```
Pantalla: /matches
Servicios: MatchService, ChampionshipService, TeamService, I18nService

Filtros:
├── por fecha
├── por campeonato/liga
└── por equipo

Flujo:
1. Cargar campeonatos (ChampionshipService.getActiveChampionships())
2. Cargar partidos (MatchService.getMatches() or getMatchesByDate())
3. Cargar equipos (TeamService.getTeams())
4. Aplicar filtros
```

#### 9️⃣ Detalle Público de Partido

```
Pantalla: /matches/:id
Servicios: MatchService, MatchEventService, TeamService, ChampionshipService

Información mostrada:
├── Información del partido
│   ├── Equipos (home/away)
│   ├── Score
│   ├── Estado
│   └── Fecha/Hora
├── Datos del equipo home
├── Datos del equipo away
└── Eventos del partido

Flujo:
1. Cargar partido (MatchService.getMatchById(id))
2. Cargar eventos (MatchEventService.getMatchEventsWithPolling())
3. Cargar equipos (TeamService.getTeamById(homeTeamId), getTeamById(awayTeamId))
```

---

### **MÓDULO SUPER-ADMIN**

#### 🔟 Gestión de Organizaciones

```
Pantalla: /super-admin/organizations, /super-admin/organizations/:id
Servicios: OrganizationService (necesario implementar)

Acciones:
1. Listar todas las organizaciones
2. Ver detalles (admin asignado, campeonatos)
3. Crear nueva organización + primer admin
4. Editar organización
```

#### 1️⃣1️⃣ Gestión de Anuncios

```
Pantalla: /super-admin/announcements
Servicios: AnnouncementService (NECESARIO CREAR)

Acciones:
1. Listar anuncios
2. Crear anuncio (global, organización o campeonato específico)
3. Editar anuncio
4. Deletear anuncio
5. Pinear/desempinear
```

---

## 📡 Endpoints Necesarios en Backend

### **1. Authentication**

```
POST   /api/auth/login                    // Login
POST   /api/auth/logout                   // Logout (opcional)
GET    /api/auth/me                       // Usuario actual
POST   /api/auth/refresh                  // Renovar token
```

### **2. Organizations**

```
GET    /api/organizations                 // Listar todas
GET    /api/organizations/:id             // Detalle
POST   /api/organizations                 // Crear
PATCH  /api/organizations/:id             // Actualizar
DELETE /api/organizations/:id             // Eliminar
GET    /api/organizations/:id/admins      // Admins de org
GET    /api/organizations/:id/championships // Campeonatos
```

### **3. Championships**

```
GET    /api/championships                 // Listar por org
GET    /api/championships/all             // Todos (filtrar status)
GET    /api/championships/:id             // Detalle
POST   /api/championships                 // Crear
PATCH  /api/championships/:id             // Actualizar
DELETE /api/championships/:id             // Eliminar
GET    /api/championships/:id/teams       // Equipos
GET    /api/championships/:id/matches     // Partidos
GET    /api/championships/:id/standings   // Tabla
```

### **4. Teams**

```
GET    /api/teams/all                     // Listar por championship/org
GET    /api/teams/:id                     // Detalle
POST   /api/teams                         // Crear
PATCH  /api/teams/:id                     // Actualizar
DELETE /api/teams/:id                     // Eliminar
GET    /api/teams/:id/players             // Jugadores del equipo
POST   /api/teams/import-csv              // Importar CSV
```

### **5. Players**

```
GET    /api/players                       // Listar (filtrar por team/championship/org)
GET    /api/players/:id                   // Detalle
POST   /api/players                       // Crear
PATCH  /api/players/:id                   // Actualizar
DELETE /api/players/:id                   // Eliminar
POST   /api/players/import-csv            // Importar CSV
GET    /api/players/:id/stats             // Estadísticas
```

### **6. Matches**

```
GET    /api/matches                       // Listar (filtrar por org/championship/status)
GET    /api/matches/all                   // Listar por championship (con date filter)
GET    /api/matches/:id                   // Detalle
POST   /api/matches                       // Crear
PATCH  /api/matches/:id                   // Actualizar
PATCH  /api/matches/:id                   // Actualizar score
DELETE /api/matches/:id                   // Eliminar
```

### **7. Match Events**

```
GET    /api/events                        // Listar por match
GET    /api/events/:id                    // Detalle
POST   /api/events                        // Crear evento
PATCH  /api/events/:id                    // Actualizar evento
DELETE /api/events/:id                    // Eliminar evento
```

### **8. Standings** (Tabla de Posiciones)

```
GET    /api/standings                     // Listar (filtrar por championship)
GET    /api/standings/:id                 // Detalle
POST   /api/standings                     // Crear (manual)
PATCH  /api/standings/:id                 // Actualizar (manual)
```

### **9. Announcements**

```
GET    /api/announcements                 // Listar
GET    /api/announcements/:id             // Detalle
POST   /api/announcements                 // Crear
PATCH  /api/announcements/:id             // Actualizar
DELETE /api/announcements/:id             // Eliminar
```

### **10. Sport Configuration**

```
GET    /api/sports                        // Listar deportes
GET    /api/sports/:sport                 // Config de deporte
```

---

## 🗂️ Matriz de Dependencias

### Servicios por Pantalla

| Pantalla               | Auth | Championship | Team | Player | Match | Event | Organization | Announcement |
| ---------------------- | ---- | ------------ | ---- | ------ | ----- | ----- | ------------ | ------------ |
| Login                  | ✅   | -            | -    | -      | -     | -     | -            | -            |
| Dashboard Admin        | ✅   | ✅           | ✅   | ✅     | ✅    | -     | -            | -            |
| Championships List     | ✅   | ✅           | -    | -      | -     | -     | -            | -            |
| Championship Detail    | ✅   | ✅           | ✅   | ✅     | ✅    | -     | -            | -            |
| Championship Form      | ✅   | ✅           | -    | -      | -     | -     | -            | -            |
| Fixture Generator      | ✅   | ✅           | ✅   | -      | ✅    | -     | -            | -            |
| Fixtures List          | ✅   | ✅           | ✅   | -      | ✅    | -     | -            | -            |
| Match Control          | ✅   | ✅           | ✅   | ✅     | ✅    | ✅    | -            | -            |
| Matches List (Admin)   | ✅   | ✅           | ✅   | -      | ✅    | -     | -            | -            |
| Players List           | ✅   | ✅           | ✅   | ✅     | -     | -     | -            | -            |
| Player Form            | ✅   | ✅           | ✅   | ✅     | -     | -     | -            | -            |
| Teams List             | ✅   | ✅           | ✅   | -      | -     | -     | -            | -            |
| Team Detail            | ✅   | ✅           | ✅   | ✅     | -     | -     | -            | -            |
| Team Form              | ✅   | ✅           | ✅   | -      | -     | -     | -            | -            |
| Standings              | ✅   | ✅           | ✅   | -      | ✅    | -     | -            | -            |
| Matches List (Public)  | -    | ✅           | ✅   | -      | ✅    | -     | -            | -            |
| Match Details (Public) | -    | ✅           | ✅   | ✅     | ✅    | ✅    | -            | -            |
| Organizations List     | ✅   | -            | -    | -      | -     | -     | ✅           | -            |
| Organization Detail    | ✅   | ✅           | -    | -      | -     | -     | ✅           | -            |
| Announcements List     | ✅   | -            | -    | -      | -     | -     | -            | ✅           |
| Announcement Form      | ✅   | ✅           | -    | -      | -     | -     | -            | ✅           |

---

## 🔴 Servicios Faltantes a Implementar en Backend

### **CRÍTICOS (Deben existir):**

1. ✅ **AuthService** endpoints - Existe
2. ✅ **ChampionshipService** - Existe
3. ✅ **TeamService** - Existe
4. ✅ **PlayerService** - Existe
5. ✅ **MatchService** - Existe
6. ✅ **MatchEventService** - Existe
7. ⚠️ **OrganizationService** - Existe pero simplificado
8. ❌ **AnnouncementService** - **NO EXISTE - CREAR**

### **OPCIONALES (Mejorar):**

- Sport Configuration Service (probablemente hardcoded)
- Standing Service (podría ser calculado automáticamente)
- Reporting Service
- Import CSV utilities

---

## 💾 Notas sobre Desnormalización

El proyecto usa **desnormalización intencional** en varias entidades:

- **Team** contiene `organizationId` (para queries rápidas)
- **Player** contiene `organizationId` y `championshipId` (para filtros)
- **Match** contiene `organizationId` (para queries de admin)
- **Standing** mantiene histórico de posición (`previousPosition`)

**Ventajas:**

- Queries más rápidas sin joins complejos
- Rendimiento mejorado para lecturas frecuentes

**Desventajas:**

- Debe mantenerse consistencia en actualizaciones
- Requiere cuidado en migraciones

---

## 📊 Diagrama de Flujo de Datos

```
┌─────────────┐
│  Frontend   │
│ Components  │
└──────┬──────┘
       │
       ▼
    ┌──────────────────────┐
    │   Angular Services   │
    ├──────────────────────┤
    │  - AuthService       │
    │  - ChampionshipSvc   │
    │  - TeamService       │
    │  - PlayerService     │
    │  - MatchService      │
    │  - MatchEventService │
    │  - OrganizationSvc   │
    └──────────┬───────────┘
               │
               ▼ HTTP
    ┌──────────────────────┐
    │   Backend API        │
    ├──────────────────────┤
    │  Express.js          │
    │  Controllers         │
    │  Route Handlers      │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │    Business Logic    │
    ├──────────────────────┤
    │  Use Cases           │
    │  Domain Models       │
    │  Repositories        │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │   MongoDB Database   │
    ├──────────────────────┤
    │  Collections:        │
    │  - users             │
    │  - organizations     │
    │  - championships     │
    │  - teams             │
    │  - players           │
    │  - matches           │
    │  - match_events      │
    │  - standings         │
    │  - announcements     │
    └──────────────────────┘
```

---

## ✅ Resumen: Qué Necesita el Backend

### Implementación Obligatoria:

1. **AnnouncementService** con endpoints CRUD
2. **Validaciones robustas** en todas las entidades
3. **Cálculo automático de Standings** cuando se crea/actualiza MatchEvent
4. **Cálculo automático de PlayerStats** cuando se crea/actualiza MatchEvent
5. **Relaciones correctas** entre entidades (FK, índices)

### Mejoras Recomendadas:

1. **Paginación** en endpoints de listado (GET /championships, /teams, /players, /matches)
2. **Filtros avanzados** (status, fecha, organización, etc)
3. **Búsqueda** por nombre/slug
4. **Agregaciones** para estadísticas
5. **Webhooks o WebSockets** para actualizaciones en tiempo real (partidos en vivo)
6. **Validación de importación CSV** robusto

### Validaciones Críticas:

- ✅ No permiti duplicar equipos en un campeonato
- ✅ No permite eliminar equipo si tiene partidos/jugadores activos
- ✅ Validar que los jugadores del evento existan en el equipo
- ✅ Prevenir cambios en campeonato después de iniciar
- ✅ Validar números de camiseta únicos por equipo

---

## 🎯 Conclusión

**IcePlay** es una aplicación deportiva bien estructurada con:

- **9 entidades principales** bien diferenciadas
- **12 servicios frontend** para interactuar con el backend
- **Flujo de datos claro** desde usuario → frontend → backend → DB
- **Módulos independientes** (admin, public, super-admin)
- **Manejo de tres deportes** (fútbol, baloncesto, voleibol) con configuración flexible

La arquitectura soporta múltiples organizaciones, campeonatos, equipos y jugadores con control granular de permisos basado en roles.

---

_Documento generado: 5 de marzo de 2026_
