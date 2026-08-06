import * as THREE from 'three'
import type {
  AttributesData,
  CareerPeriod,
  ContactData,
  Profile,
  SkillKey,
  SkillLabel,
} from '../types/portfolio'
import type { MatchItem } from '../types/projects'
import { createOverviewBillboard } from './billboard'
import {
  createContactExhibits,
  nearestContactLink,
  type ContactLinkHandle,
} from './contactExhibits'
import {
  createProjectExhibits,
  nearestExhibit,
  type ExhibitHandle,
} from './exhibits'
import {
  createExperienceExhibits,
} from './experienceExhibits'
import { EXIT_PORTALS, MAP, PROP_SCALE, SPAWN, CONTACT_DESK } from './layout'
import {
  createSkillsExhibits,
  type SkillsExhibitsHandle,
} from './skillsExhibits'
import {
  createStaffNpc,
  isNearStaff,
  type StaffHandle,
} from './staff'
import { createMuseumWorld, resolveMove } from './world'

export interface MuseumInput {
  moveX: number
  moveZ: number
  sprint: boolean
  jump: boolean
}

export interface MuseumState {
  x: number
  z: number
  mapW: number
  mapH: number
  nearProjectKey: string | null
  nearExit: (typeof EXIT_PORTALS)[number]['id'] | null
  nearStaff: boolean
  nearContactStaff: boolean
  nearContactLink: { label: string; href: string } | null
}

export interface MuseumSession {
  setInput: (input: MuseumInput) => void
  setProfile: (profile: Profile) => void
  setAttributes: (attributes: AttributesData | null) => void
  setProjects: (projects: MatchItem[]) => void
  setExperience: (
    experience: CareerPeriod[],
    skillLabels?: Record<SkillKey, SkillLabel> | null,
  ) => void
  setContact: (contact: ContactData | null) => void
  setStaffAlert: (visible: boolean) => void
  /** Apply mouse look immediately (avoids frame-batched jitter) */
  applyLook: (movementX: number, movementY: number) => void
  tick: (dt: number) => MuseumState
  getState: () => MuseumState
  dispose: () => void
}

/** First-person tuned to PROP_SCALE (linkwalk ratios × world scale) */
const EYE_HEIGHT = 2.2 * PROP_SCALE
const MOVE_SPEED = 4.2 * PROP_SCALE
const SPRINT_MULT = 1.75
const GRAVITY = -18 * PROP_SCALE
const JUMP_SPEED = 6.2 * Math.sqrt(PROP_SCALE)
const MOUSE_SENS = 0.0022
const PITCH_LIMIT = Math.PI / 2 - 0.01
const PLAYER_RADIUS = 0.35 * PROP_SCALE
const EXIT_NEAR = 2.8 * PROP_SCALE
/** Ignore browser movement spikes */
const MAX_LOOK_DELTA = 40

export function createMuseumSession(host: HTMLElement): MuseumSession {
  const world = createMuseumWorld(host)
  const staff: StaffHandle = createStaffNpc()
  world.scene.add(staff.root)

  // Contact reception staff — behind east-wall desk, facing into room
  const contactStaff: StaffHandle = createStaffNpc({
    x: CONTACT_DESK.x + CONTACT_DESK.w * 0.55 + 0.4 * PROP_SCALE,
    z: CONTACT_DESK.z,
    yaw: -Math.PI / 2,
    withAlert: true,
  })
  world.scene.add(contactStaff.root)

  let billboard: ReturnType<typeof createOverviewBillboard> | null = null
  let exhibits: ExhibitHandle[] = []
  let exhibitGroup: THREE.Group | null = null
  let careerGroup: THREE.Group | null = null
  let contactGroup: THREE.Group | null = null
  let contactLinks: ContactLinkHandle[] = []
  let skillsHandle: SkillsExhibitsHandle | null = null

  let x = SPAWN.x
  let z = SPAWN.z
  let yaw = SPAWN.yaw
  let pitch = 0
  let velY = 0
  let grounded = true

  let input: MuseumInput = {
    moveX: 0,
    moveZ: 0,
    sprint: false,
    jump: false,
  }

  world.camera.rotation.order = 'YXZ'
  world.camera.position.set(x, EYE_HEIGHT, z)
  world.camera.rotation.y = yaw
  world.camera.rotation.x = pitch

  function clearExhibits() {
    if (exhibitGroup) {
      world.scene.remove(exhibitGroup)
      exhibitGroup = null
    }
    exhibits = []
  }

  function clearCareers() {
    if (careerGroup) {
      world.scene.remove(careerGroup)
      careerGroup = null
    }
  }

  function clearContact() {
    if (contactGroup) {
      world.scene.remove(contactGroup)
      contactGroup = null
    }
    contactLinks = []
  }

  function clearSkills() {
    if (skillsHandle) {
      skillsHandle.dispose()
      skillsHandle = null
    }
  }

  function clearBillboard() {
    if (billboard) {
      world.scene.remove(billboard.group)
      billboard.dispose()
      billboard = null
    }
  }

  function state(): MuseumState {
    let nearExit: MuseumState['nearExit'] = null
    for (const p of EXIT_PORTALS) {
      if (Math.hypot(x - p.x, z - p.z) < EXIT_NEAR) {
        nearExit = p.id
        break
      }
    }
    return {
      x,
      z,
      mapW: MAP.maxX - MAP.minX,
      mapH: MAP.maxZ - MAP.minZ,
      nearProjectKey: nearestExhibit(exhibits, x, z),
      nearExit,
      nearStaff: isNearStaff(staff, x, z),
      nearContactStaff: isNearStaff(contactStaff, x, z),
      nearContactLink: (() => {
        const hit = nearestContactLink(
          contactLinks,
          x,
          z,
          world.camera.position.y,
          yaw,
          pitch,
        )
        return hit ? { label: hit.label, href: hit.href } : null
      })(),
    }
  }

  return {
    setInput(next) {
      input = next
    },
    setStaffAlert(visible) {
      staff.setAlertVisible(visible)
      contactStaff.setAlertVisible(visible)
    },
    applyLook(movementX, movementY) {
      const dx = Math.max(-MAX_LOOK_DELTA, Math.min(MAX_LOOK_DELTA, movementX))
      const dy = Math.max(-MAX_LOOK_DELTA, Math.min(MAX_LOOK_DELTA, movementY))
      if (dx === 0 && dy === 0) return
      yaw -= dx * MOUSE_SENS
      pitch -= dy * MOUSE_SENS
      pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch))
      world.camera.rotation.y = yaw
      world.camera.rotation.x = pitch
    },
    setProfile(p) {
      clearBillboard()
      billboard = createOverviewBillboard(p)
      world.scene.add(billboard.group)
    },
    setAttributes(attributes) {
      clearSkills()
      skillsHandle = createSkillsExhibits(world.scene, attributes)
    },
    setProjects(projects) {
      clearExhibits()
      exhibitGroup = new THREE.Group()
      world.scene.add(exhibitGroup)
      exhibits = createProjectExhibits(exhibitGroup, projects)
    },
    setExperience(experience, skillLabels = null) {
      clearCareers()
      careerGroup = new THREE.Group()
      world.scene.add(careerGroup)
      createExperienceExhibits(careerGroup, experience, skillLabels)
    },
    setContact(contact) {
      clearContact()
      contactGroup = new THREE.Group()
      world.scene.add(contactGroup)
      contactLinks = createContactExhibits(contactGroup, contact)
    },
    getState: state,
    dispose() {
      clearExhibits()
      clearCareers()
      clearContact()
      clearSkills()
      clearBillboard()
      world.dispose()
    },
    tick(dt) {
      const len = Math.hypot(input.moveX, input.moveZ)
      if (len > 0.05) {
        const nx = input.moveX / len
        const nz = input.moveZ / len
        const speed = MOVE_SPEED * (input.sprint ? SPRINT_MULT : 1)
        const sin = Math.sin(yaw)
        const cos = Math.cos(yaw)
        const dx = (cos * nx + -sin * nz) * speed * dt
        const dz = (-sin * nx + -cos * nz) * speed * dt
        const next = resolveMove(world.colliders, x, z, dx, dz, PLAYER_RADIUS)
        x = next.x
        z = next.z
      }

      velY += GRAVITY * dt
      if (input.jump && grounded) {
        velY = JUMP_SPEED
        grounded = false
      }
      let y = world.camera.position.y + velY * dt
      if (y <= EYE_HEIGHT) {
        y = EYE_HEIGHT
        velY = 0
        grounded = true
      }
      world.camera.position.set(x, y, z)
      world.camera.rotation.y = yaw
      world.camera.rotation.x = pitch

      billboard?.update(dt)
      skillsHandle?.update(dt)
      staff.updateAlert(dt)
      contactStaff.updateAlert(dt)
      world.renderer.render(world.scene, world.camera)
      return state()
    },
  }
}
