
import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
// import Logo from '../../public/assets/logo.png'
import {
  Home,
  Activity,
  Ship,
  Anchor,
  Zap,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Search,
  Database,
  User,
  TrainFront
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock Notifications
  const notifications = [
    { id: 1, title: 'Optimization Complete', msg: 'Route analysis for MV Alpha finished.', time: '2m ago', type: 'success' },
    { id: 2, title: 'High Risk Alert', msg: 'Rourkela Coal stock below 3 days.', time: '1h ago', type: 'error' },
    { id: 3, title: 'System Update', msg: 'Backend connected to Digital Twin v2.1.', time: '5h ago', type: 'info' }
  ];

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      alert(`Searching for: ${searchQuery} (Global Search Not Implemented yet)`);
      // Future: Filter navItems or trigger global search
    }
  }

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home, allowedRoles: ['all'] },
    { path: '/vessel-scheduling', label: 'Logistics Control Tower', icon: Ship, allowedRoles: ['admin', 'corporate_logistics', 'port_manager', 'railway_officer', 'finance'] },
    { path: '/port-planning', label: 'Planning', icon: Anchor, allowedRoles: ['admin', 'corporate_logistics', 'port_manager', 'ai_analyst'] },
    { path: '/railway-dispatch', label: 'Railway Dispatch', icon: TrainFront, allowedRoles: ['admin', 'corporate_logistics', 'railway_officer', 'port_manager', 'plant_head'] },
    { path: '/optimization', label: 'Optimization', icon: Zap, allowedRoles: ['admin', 'corporate_logistics', 'ai_analyst', 'finance'] },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, allowedRoles: ['all'] },
    { path: '/data-integration', label: 'Data Integration', icon: Database, allowedRoles: ['admin', 'ai_analyst'] },
    { path: '/settings', label: 'Settings', icon: Settings, allowedRoles: ['admin'] },
  ]

  const userRole = user?.role || 'viewer';

  const filteredNavItems = navItems.filter(item =>
    item.allowedRoles.includes('all') || item.allowedRoles.includes(userRole)
  );

  return (
    <div className="h-screen overflow-hidden flex bg-background-page font-sans text-text-blue-600">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 hover:bg-blue-600-dark transition-all"
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
        className={`fixed lg:relative inset-y-0 left-0 z-40 flex-shrink-0 bg-background-sidebar border-r border-gray-200 flex flex-col py-6 transition-all ease-[0.4,0,0.2,1] overflow-hidden shadow-sm
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${hoveredNav === 'expanded' ? 'duration-500' : 'duration-[1000ms]'}
        `}
        style={{ width: hoveredNav === 'expanded' || mobileMenuOpen ? '260px' : '80px' }}
        onMouseEnter={() => !mobileMenuOpen && setHoveredNav('expanded')}
        onMouseLeave={() => !mobileMenuOpen && setHoveredNav(null)}
      >
        {/* Logo Section */}
        <div className="w-full px-3 mb-6 mt-2 flex items-center gap-3">
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
            <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 pt-1 object-contain" />
          </div>
          <span
            className={`whitespace-nowrap text-lg font-bold text-text-blue-600 transition-all ease-[0.4,0,0.2,1] ${hoveredNav === 'expanded' || mobileMenuOpen
              ? 'opacity-100 translate-x-0 delay-100 duration-500'
              : 'opacity-0 -translate-x-10 absolute left-[68px] pointer-events-none duration-700'
              }`}
          >
            SAIL LOGISTICS          </span>
        </div>

        <div className="flex flex-col gap-1 px-3">
          {/* Section Label */}
          {/* {(hoveredNav === 'expanded' || mobileMenuOpen) && (
              <div className="px-4 mb-2 text-[11px] font-bold text-text-muted uppercase track-wider">
              </div>
            )} */}

          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            const isExpanded = hoveredNav === 'expanded' || mobileMenuOpen

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`relative flex items-center h-10 px-3 py-2 rounded-lg transition-all duration-00 group ${isActive
                  ? 'bg-blue-600/10 text-blue-600'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-blue-600'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md bg-blue-600" />
                )}

                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-colors  ${isActive ? 'text-blue-600' : 'text-text-secondary group-hover:text-text-blue-600'}`}
                />

                <span
                  className={`ml-3 whitespace-nowrap text-sm font-medium transition-all ease-[0.4,0,0.2,1] ${isExpanded
                    ? 'opacity-100 translate-x-0 delay-5 duration-500'
                    : 'opacity-0 -translate-x-4 absolute left-[48px] pointer-events-none'
                    }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>


        {/* Logout Button */}
        <div className="w-full px-3 mt-auto">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={`relative flex items-center h-10 px-3 py-2 rounded-lg transition-all duration-600 text-text-secondary hover:bg-red-50 hover:text-red-500 w-full group`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span
              className={`ml-3 whitespace-nowrap text-sm font-medium transition-all ease-[0.4,0,0.2,1] ${hoveredNav === 'expanded' || mobileMenuOpen
                ? 'opacity-100 translate-x-0 delay-100 duration-600'
                : 'opacity-0 -translate-x-4 absolute left-[48px] pointer-events-none'
                }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 bg-background-page">
        {/* Top Bar */}
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          {/* Spacer for mobile menu button */}
          <div className="w-12 lg:hidden" />

          {/* Greeting */}
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-text-blue-600">Welcome back!</h2>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-blue-900 placeholder-text-muted focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:text-sm transition-all duration-200"
                placeholder="Search ports, plants, vessels..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 items-center ml-4 relative">
            <button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-text-secondary transition-colors"
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors relative ${showNotifications ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-text-secondary'}`}
              title="Notifications"
            >
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                  <span className="text-xs text-blue-600 cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${n.type === 'error' ? 'bg-red-100 text-red-600' : n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {n.type === 'error' ? 'Alert' : n.type === 'success' ? 'Success' : 'Info'}
                        </span>
                        <span className="text-[10px] text-gray-400">{n.time}</span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-800">{n.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{n.msg}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                  <Link to="/analytics" onClick={() => setShowNotifications(false)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All Activity</Link>
                </div>
              </div>
            )}

            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
            <button className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-white uppercase">
                {user?.name ? user.name.substring(0, 2) : 'GU'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-blue-900">{user?.name || 'Guest User'}</div>
                <div className="text-[10px] text-gray-500 capitalize">{user?.role ? user.role.replace('_', ' ') : 'Viewer'}</div>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
