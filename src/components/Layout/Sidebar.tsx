import { Link, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../../services/authService'
import logoImage from '../../assets/logo.svg'

export default function Sidebar() {
    const location = useLocation()
    const currentUser = getCurrentUser()

    const isActive = (path: string) => location.pathname === path

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
            {/* Logo */}
            <div className="h-[72px] px-6 border-b border-gray-200 flex items-center">
                <Link to="/home" className="flex items-center gap-2">
                    <img src={logoImage} alt="ASKku" className="w-8 h-8" />
                    <span className="text-lg font-bold text-askku-primary">ASKku</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3">
                <Link
                    to="/home"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${isActive('/home')
                        ? 'bg-askku-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="font-medium">홈</span>
                </Link>

                <Link
                    to="/chat"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${isActive('/chat')
                        ? 'bg-askku-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="font-medium">채팅</span>
                </Link>

                <Link
                    to="/mypage"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/mypage')
                        ? 'bg-askku-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="font-medium">마이페이지</span>
                </Link>
            </nav>

            {/* User Profile */}
            <div className="h-[80px] px-6 border-t border-gray-200 flex items-center">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {currentUser?.name || '사용자'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {currentUser?.department || '학과'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
