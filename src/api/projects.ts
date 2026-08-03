import axios from 'axios'
import type { MatchItem, RemoteProject } from '../types/projects'

const PROJECTS_URL = 'https://soondooop.github.io/data/projects.json'

const CLUB_DESK: MatchItem = {
  key: 'club-desk',
  id: 'club-desk',
  title: 'Club Desk',
  summary:
    '목록 CRUD와 제안 Inbox를 React + Redux Toolkit + Axios로 구현한 관리자형 데모 앱.',
  image: null,
  stack: ['React', 'Redux Toolkit', 'Axios', 'Vite'],
  link: '/club-desk',
  featured: true,
  role: 'Frontend',
  competition: 'Demo App',
  contribution: [
    '목록·검색·필터·페이지네이션',
    '등록/수정 모달 및 일괄 처리',
    '인증·토스트·에러 등 어드민 UX',
  ],
}

function inferRole(tags: string[] = []): string {
  const joined = tags.join(' ').toLowerCase()
  if (joined.includes('react') || joined.includes('vue')) return 'Frontend'
  return 'Publisher'
}

function inferCompetition(tags: string[] = []): string {
  if (tags.some((t) => /wordpress/i.test(t))) return 'WordPress'
  if (tags.some((t) => /ajax/i.test(t))) return 'Interactive'
  if (tags.some((t) => /gsap/i.test(t))) return 'Motion'
  return 'Web'
}

export function mapRemoteProject(
  project: RemoteProject,
  index: number,
): MatchItem {
  const tags = Array.isArray(project.tags) ? project.tags : []
  return {
    key: `remote-${project.id}-${index}`,
    id: project.id,
    title: project.title,
    summary: project.description || '',
    image: project.image || null,
    stack: tags,
    link: project.link || null,
    featured: false,
    role: inferRole(tags),
    competition: inferCompetition(tags),
    contribution: Array.isArray(project.contribution)
      ? project.contribution
      : [],
  }
}

export async function fetchProjects(): Promise<MatchItem[]> {
  const { data } = await axios.get<RemoteProject[]>(PROJECTS_URL, {
    headers: { Accept: 'application/json' },
  })
  const list = Array.isArray(data) ? data : []
  return [CLUB_DESK, ...list.map(mapRemoteProject)]
}
