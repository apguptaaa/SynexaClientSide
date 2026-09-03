import { Home, MessageSquare, User, Settings, X } from 'lucide-react'

type SidebarProps = {
    isOpen: boolean
    onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const currentPath = window.location.pathname

    const navItems = [
        { name: 'Home', path: '/', icon: <Home size={20} /> },
        { name: 'Chat', path: '/chat', icon: <MessageSquare size={20} /> },
        { name: 'Profile', path: '/profile', icon: <User size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ]

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <img src="/assets/logos/synexa-logo.svg" alt="Synexa logo" width={32} height={32} />
                        <strong>Synexa</strong>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.path || (currentPath === '/home' && item.path === '/')
                        return (
                            <a
                                key={item.name}
                                href={item.path}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </a>
                        )
                    })}
                </nav>
            </aside>
        </>
    )
}
