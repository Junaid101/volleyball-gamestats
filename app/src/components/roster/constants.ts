import type { PlayerPosition } from '../../types'

export const POSITION_OPTIONS: PlayerPosition[] = [
  'outside',
  'opposite',
  'middle',
  'setter',
  'libero',
  'defensive',
]

export const POSITION_BADGE_CLASSES: Record<PlayerPosition, string> = {
  setter: 'bg-purple-600',
  libero: 'bg-yellow-600 text-gray-900',
  outside: 'bg-blue-600',
  opposite: 'bg-blue-600',
  middle: 'bg-green-600',
  defensive: 'bg-orange-600',
}
