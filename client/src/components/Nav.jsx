import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

function Nav() {
    const [isOpen, setIsOpen] = useState(false)

    const navLinks = [

        { title: "Dashboard", href: '/dashboard' },
        { title: "Skill Picker", href: '/skills' },
        { title: "Log Workout", href: '/workout' },
        { title: "History", href: '/history' }
    ]
    return (
        <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Link to="/" className="text-indigo-400 font-bold text-lg tracking-tight">
                    Calisthenics AI
                </Link>
                <div className="flex gap-6">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.href}
                            to={link.href}
                            className={({ isActive }) =>
                                isActive
                                    ? "text-indigo-400 font-medium text-sm"
                                    : "text-zinc-400 hover:text-white text-sm transition"
                            }
                        >
                            {link.title}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    )
}

export default Nav