import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
// import Logo from '../../public/assets/logo.png'

import {
  Home,
  Activity,
  Ship,
  Anchor,
  Train,
  Zap,
  BarChart3,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Search
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/monitoring', label: 'Real-Time Monitoring', icon: Activity },
    { path: '/vessel-scheduling', label: 'Vessel Scheduling', icon: Ship },
    { path: '/port-planning', label: 'Port Planning', icon: Anchor },
    { path: '/railway-dispatch', label: 'Railway Dispatch', icon: Train },
    { path: '/optimization', label: 'Optimization', icon: Zap },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="h-screen overflow-hidden flex bg-background-page font-sans text-text-primary">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 flex-shrink-0 bg-gradient-to-b from-[#1A1F3A] to-[#0B0E31] border-r border-gray-800 flex flex-col items-center py-6 transition-all ease-[0.4,0,0.2,1] overflow-hidden shadow-sidebar
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${hoveredNav === 'expanded' ? 'duration-500' : 'duration-[1000ms]'}
        `}
        style={{ width: hoveredNav === 'expanded' || mobileMenuOpen ? '260px' : '80px' }}
        onMouseEnter={() => !mobileMenuOpen && setHoveredNav('expanded')}
        onMouseLeave={() => !mobileMenuOpen && setHoveredNav(null)}
      >
        {/* Logo Section */}
        <div className="w-full px-4 mb-6">
          <div
            className={`relative flex items-center transition-all duration-500 ease-[0.4,0,0.2,1] ${hoveredNav === 'expanded' || mobileMenuOpen ? 'rounded-xl px-4 justify-start' : 'rounded-full justify-center px-0'
              }`}
            style={{
              height: '48px',
              width: '100%',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden z-20 relative">
              <img src="/assets/logo.png" alt="SAIL Logistics Logo" className="w-8 h-8 object-cover mt-1" />
            </div>
            <span
              className={`ml-3 whitespace-nowrap text-sm font-bold text-white transition-all ease-[0.4,0,0.2,1] z-10 ${hoveredNav === 'expanded' || mobileMenuOpen
                ? 'opacity-100 translate-x-0 delay-100 duration-500'
                : 'opacity-0 -translate-x-10 absolute left-[68px] pointer-events-none duration-700'
                }`}
            >
              SAIL Logistics
            </span>
          </div>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          const isExpanded = hoveredNav === 'expanded' || mobileMenuOpen

          return (
            <div
              key={item.path}
              className="w-full px-4 mb-2"
            >
              <Link
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`relative flex items-center transition-all duration-500 ease-[0.4,0,0.2,1] ${isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-text-tertiary hover:bg-white/10 hover:text-white'
                  } ${isExpanded ? 'rounded-xl px-4' : 'rounded-full justify-center px-0'}`}
                style={{
                  height: '48px',
                  width: '100%',
                }}
              >
                <Icon size={24} className="flex-shrink-0 z-20 relative" />
                <span
                  className={`ml-3 whitespace-nowrap text-sm font-medium transition-all ease-[0.4,0,0.2,1] z-10 ${isExpanded
                    ? 'opacity-100 translate-x-0 delay-5  duration-500'
                    : 'opacity-0 -translate-x-10 absolute left-[52px] pointer-events-none duration-700'
                    }`}
                >
                  {item.label}
                </span>
              </Link>
            </div>
          )
        })}

        {/* Logout Button */}
        <div className="w-full px-4 mt-auto">
          <button
            onClick={() => navigate('/login')}
            className={`relative flex items-center transition-all duration-500 ease-[0.4,0,0.2,1] text-text-tertiary hover:bg-white/10 hover:text-white ${hoveredNav === 'expanded' || mobileMenuOpen ? 'rounded-xl px-4' : 'rounded-full justify-center px-0'
              }`}
            style={{
              height: '48px',
              width: '100%',
            }}
          >
            <LogOut size={24} className="flex-shrink-0 z-20 relative" />
            <span
              className={`ml-3 whitespace-nowrap text-sm font-medium transition-all ease-[0.4,0,0.2,1] z-10 ${hoveredNav === 'expanded' || mobileMenuOpen
                ? 'opacity-100 translate-x-0 delay-100 duration-500'
                : 'opacity-0 -translate-x-10 absolute left-[52px] pointer-events-none duration-700'
                }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Bar */}
        <header className="h-20 bg-transparent flex items-center justify-between px-4 lg:px-8">
          {/* Spacer for mobile menu button */}
          <div className="w-12 lg:hidden" />

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4 lg:mx-0">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 sm:text-sm backdrop-blur-md transition-all duration-300"
                placeholder="Search for shipments, vessels, or reports..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 items-center ml-4">
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer text-white hover:bg-white/20 transition-all backdrop-blur-sm">
              <Bell size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-all shadow-lg shadow-primary/30">
              <User size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
