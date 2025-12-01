import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

interface MainLayoutProps {
    children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation()
    const hideHeaderRoutes = ['/chat', '/mypage']
    const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname)

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                {shouldShowHeader && <Header />}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
