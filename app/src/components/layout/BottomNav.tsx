import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/roster', label: 'Roster', icon: '👥' },
  { to: '/history', label: 'History', icon: '☰' },
  { to: '/players', label: 'Players', icon: '▤' },
] as const

export default function BottomNav({ hide = false }: { hide?: boolean }) {
  if (hide) {
    return null
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-gray-800 bg-gray-900/95 backdrop-blur pb-safe">
      <ul className="mx-auto grid max-w-screen-sm grid-cols-4 gap-2 px-2 py-3 text-xs">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              className={({ isActive }) =>
                `min-h-[56px] rounded-xl px-2 py-2 flex flex-col items-center justify-center gap-1 transition ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`
              }
              end={item.to === '/'}
              to={item.to}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
