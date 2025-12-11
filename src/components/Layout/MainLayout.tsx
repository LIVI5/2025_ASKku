import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

interface MainLayoutProps {
    children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation()
    const isHomePage = location.pathname === '/home'

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <main className={`flex-1 overflow-auto ${isHomePage ? 'pt-[72px]' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    )
}
