import { useState } from 'react'
import { BrowserRouter, href, Link, NavLink } from 'react-router-dom'

function Nav() {
    const [isOpen, setIsOpen] = useState(false)

    const navLinks = [
        { title: "Dashboard", href: '/' },
        { title: "Skill Picker", href: '/skills' },
        { title: "Log Workout", href: '/workout' },
        { title: "History", href: '/history' }
    ]
    return (
        <nav>
            <div>
                <div>
                    <Link to="/" onClick={() => setIsOpen(false)}>
                        Calisthenics ai
                    </Link>
                </div>
                <div>
                    {navLinks.map((link) => (
                        <NavLink key={link.href} to={link.href}>
                            {link.title}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    )
}

export default Nav