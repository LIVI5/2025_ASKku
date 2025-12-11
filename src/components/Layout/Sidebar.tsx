import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import logoImage from '../../assets/logo.svg'
import { useUser } from '../../contexts/UserContext'
import PasswordVerificationModal from '../Modals/PasswordVerificationModal'
import EditPersonalInfoModal from '../MyPage/EditPersonalInfoModal'

export default function Sidebar() {
    const location = useLocation()
    const { user, loading } = useUser()
    const [showPasswordVerificationModal, setShowPasswordVerificationModal] = useState(false)
    const [showEditInformationModal, setShowEditInformationModal] = useState(false)

    const isActive = (path: string) => location.pathname === path

    const handleEditProfile = () => {
        setShowPasswordVerificationModal(true)
    }

    const handlePasswordVerificationSuccess = (password: string) => {
        // In a real app, you'd send this password to the backend for verification
        // For now, we'll just close the verification modal and open the edit modal
        console.log('Password verified (placeholder):', password);
        setShowPasswordVerificationModal(false)
        setShowEditInformationModal(true)
    }

    const handleCloseEditInformationModal = () => {
        setShowEditInformationModal(false)
        // Optionally re-fetch user data if there was an API to save changes
        // fetchUser();
    }

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
                    <div className="flex-1 min-w-0 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold text-gray-800 truncate">
                                {loading ? '로딩 중...' : user?.name || '사용자'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {loading ? '로딩 중...' : user?.department || '학과'}
                            </p>
                        </div>
                        <button
                            onClick={handleEditProfile}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Edit Profile"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <PasswordVerificationModal
                isOpen={showPasswordVerificationModal}
                onClose={() => setShowPasswordVerificationModal(false)}
                onSuccess={handlePasswordVerificationSuccess}
            />

            <EditPersonalInfoModal
                isOpen={showEditInformationModal}
                onClose={handleCloseEditInformationModal}
            />
        </aside>
    )
}
