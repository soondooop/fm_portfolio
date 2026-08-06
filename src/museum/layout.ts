/**
 * Contiguous museum floor plan — one building, shared walls.
 *
 *          ┌──────────────────┬──────────┐
 *          │    EXPERIENCE    │          │
 *          ├──────────┬───────┤ CONTACT  │
 *          │  SKILLS  │ HALL  │          │
 *          ├──────────┤       │  exits→  │
 *   enter→ │  LOBBY   │       │          │
 *          └──────────┴───────┴──────────┘
 *          │         PROJECTS            │
 *          └─────────────────────────────┘
 */

export interface RoomDef {
  id: string
  label: string
  x: number
  z: number
  w: number
  d: number
  color: string
}

export type MarbleTone = 'carrara' | 'cream' | 'greige' | 'rose' | 'sage'

export const PROP_SCALE = 2.5
export const WALL_T = 0.55 * PROP_SCALE
/** Door clear opening height — everything above is solid header wall */
export const DOOR_H = 4.85 * PROP_SCALE

/** Outer building envelope (single mass) */
export const BUILDING = {
  minX: -56,
  maxX: 56,
  minZ: -76,
  maxZ: 46,
}

export const MAP = {
  minX: BUILDING.minX - 8,
  maxX: BUILDING.maxX + 8,
  minZ: BUILDING.minZ - 8,
  maxZ: BUILDING.maxZ + 8,
  /** Gallery ceiling — fits scaled avatars + overview board */
  wallH: 14,
}

/** Partition lines (shared walls between wings) */
export const GRID = {
  /** Projects / middle band */
  midSouth: -28,
  /** Experience / middle band */
  midNorth: 14,
  /** Lobby+Skills / Hall */
  westHall: -20,
  /** Hall / Contact */
  eastHall: 22,
  /** Lobby / Skills */
  lobbySkills: -4,
}

/**
 * Rooms — edges touch GRID lines exactly (no gaps, no overlaps).
 * x,z = center; w,d = full size.
 */
export const LOBBY = {
  id: 'lobby',
  label: 'Lobby',
  x: (BUILDING.minX + GRID.westHall) / 2,
  z: (GRID.midSouth + GRID.lobbySkills) / 2,
  w: GRID.westHall - BUILDING.minX,
  d: GRID.lobbySkills - GRID.midSouth,
  floorColor: '#8a6540',
  marble: 'cream' as MarbleTone,
}

export const SKILLS = {
  id: 'skills',
  label: 'Skills',
  x: (BUILDING.minX + GRID.westHall) / 2,
  z: (GRID.lobbySkills + GRID.midNorth) / 2,
  w: GRID.westHall - BUILDING.minX,
  d: GRID.midNorth - GRID.lobbySkills,
  floorColor: '#7d5c3c',
  marble: 'sage' as MarbleTone,
}

export const HALL = {
  id: 'corridor',
  label: 'Hall',
  x: (GRID.westHall + GRID.eastHall) / 2,
  z: (GRID.midSouth + GRID.midNorth) / 2,
  w: GRID.eastHall - GRID.westHall,
  d: GRID.midNorth - GRID.midSouth,
  floorColor: '#856240',
  marble: 'greige' as MarbleTone,
}

export const CONTACT = {
  id: 'contact',
  label: 'Contact',
  x: (GRID.eastHall + BUILDING.maxX) / 2,
  /** Tall wing: middle band + Experience’s east strip */
  z: (GRID.midSouth + BUILDING.maxZ) / 2,
  w: BUILDING.maxX - GRID.eastHall,
  d: BUILDING.maxZ - GRID.midSouth,
  floorColor: '#7a5638',
  marble: 'rose' as MarbleTone,
}

export const PROJECTS = {
  id: 'projects',
  label: 'Projects',
  x: (BUILDING.minX + BUILDING.maxX) / 2,
  z: (BUILDING.minZ + GRID.midSouth) / 2,
  w: BUILDING.maxX - BUILDING.minX,
  d: GRID.midSouth - BUILDING.minZ,
  floorColor: '#6e4c32',
  marble: 'carrara' as MarbleTone,
}

export const EXPERIENCE = {
  id: 'experience',
  label: 'Experience',
  /** Stops at Contact’s west wall (eastHall) */
  x: (BUILDING.minX + GRID.eastHall) / 2,
  z: (GRID.midNorth + BUILDING.maxZ) / 2,
  w: GRID.eastHall - BUILDING.minX,
  d: BUILDING.maxZ - GRID.midNorth,
  floorColor: '#755538',
  marble: 'greige' as MarbleTone,
}

export const ROOMS: RoomDef[] = [
  LOBBY,
  SKILLS,
  HALL,
  CONTACT,
  PROJECTS,
  EXPERIENCE,
].map((r) => ({
  id: r.id,
  label: r.label,
  x: r.x,
  z: r.z,
  w: r.w,
  d: r.d,
  color: r.floorColor,
}))

/** Enter lobby facing east (into the hall) */
export const SPAWN = {
  x: LOBBY.x - LOBBY.w * 0.2,
  z: LOBBY.z,
  /** -PI/2 → look toward +X (linkwalk yaw convention) */
  yaw: -Math.PI / 2,
}

export const FRONT_DESK = {
  x: LOBBY.x - 4,
  z: LOBBY.z - LOBBY.d * 0.22,
  w: 2.2 * PROP_SCALE,
  d: 0.8 * PROP_SCALE,
  h: 1.05 * PROP_SCALE,
}

/** Overview board — fills the lobby east wall (full height & width) */
export const OVERVIEW_BOARD = {
  x: GRID.westHall - 1.2,
  z: LOBBY.z,
  /** Along the wall (lobby depth), leave a thin side gap for the frame */
  w: LOBBY.d - 0.8,
  /** Leave a thin gap from floor/ceiling for the frame */
  h: MAP.wallH - 0.6,
  yaw: -Math.PI / 2,
}

/** Projects wing hang targets */
export const PROJECT_GALLERY = {
  x: PROJECTS.x,
  z: PROJECTS.z,
  w: PROJECTS.w,
  d: PROJECTS.d,
  wallT: WALL_T,
  doorW: 16,
  /** Painting center height ≈ scaled eye level */
  hangY: 2.55 * PROP_SCALE,
  margin: 8,
  floorColor: PROJECTS.floorColor,
  wallColor: '#f5f2ec',
}

/** Experience wing hang targets — south: Hall door, east: Contact wall */
export const EXPERIENCE_GALLERY = {
  x: EXPERIENCE.x,
  z: EXPERIENCE.z,
  w: EXPERIENCE.w,
  d: EXPERIENCE.d,
  wallT: WALL_T,
  doorW: 14,
  hangY: 2.55 * PROP_SCALE,
  margin: 5,
  floorColor: EXPERIENCE.floorColor,
  wallColor: '#f3efe8',
}

/** Contact reception desk — against east wall, faces into the room */
export const CONTACT_DESK = {
  x: BUILDING.maxX - WALL_T - 2.8,
  z: HALL.z,
  /** Depth from east wall */
  w: 1.15 * PROP_SCALE,
  /** Long axis N–S along the east wall */
  d: 3.6 * PROP_SCALE,
  h: 1.05 * PROP_SCALE,
}

export const EXIT_DOOR_W = 3.4 * PROP_SCALE

/** Contact wing — tall east room with Hall door + Exit */
export const CONTACT_GALLERY = {
  x: CONTACT.x,
  z: CONTACT.z,
  w: CONTACT.w,
  d: CONTACT.d,
  wallT: WALL_T,
  hallDoorW: 10,
  exitDoorW: EXIT_DOOR_W,
  hangY: 2.55 * PROP_SCALE,
  margin: 4,
  floorColor: CONTACT.floorColor,
  wallColor: '#f4efe9',
}

/** Exit on Contact north wall (was Links board spot) */
export const EXIT_PORTALS = [
  {
    id: 'exit' as const,
    label: 'Exit',
    x: CONTACT.x,
    z: BUILDING.maxZ - WALL_T * 0.9,
    href: '',
  },
]

export const EXIT_CHOICES = [
  {
    id: 'classic' as const,
    label: 'Classic Portfolio',
    blurb: '웹 포트폴리오 페이지로 이동합니다.',
    href: '/overview',
  },
  {
    id: 'town' as const,
    label: 'SOONDOOOP Town',
    blurb: '인터랙티브 타운으로 이동합니다.',
    href: '/play',
  },
]

/** Door openings along partition walls */
export const DOORS = {
  /** Outer west → lobby */
  entranceW: 12,
  /** Skills → hall (lobby↔hall is solid — overview wall) */
  skillsHallW: 9,
  /** Lobby → skills */
  lobbySkillsW: 8,
  /** Hall → projects */
  hallProjectsW: 16,
  /** Hall → experience */
  hallExperienceW: 14,
  /** Hall → contact */
  hallContactW: 10,
  /** Contact north wall exit */
  exitW: EXIT_DOOR_W,
}
