import { useState } from 'react'
import AlarmModal from '../AlarmModal'

export default function Header() {
    const [showAlarm, setShowAlarm] = useState(false)

    return (
        <header className="bg-white border-b border-gray-200 h-[72px] flex items-center px-6 sticky top-0 z-10">
            <div className="flex-1"></div>

            <div className="flex items-center gap-4">
                {/* Alarm Icon */}
                <button
                    onClick={() => setShowAlarm(!showAlarm)}
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M13.73 21a2 2 0 0 1-3.46 0"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {/* Settings Icon */}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        <path
                            d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </div>

            {/* Alarm Modal */}
            {showAlarm && <AlarmModal onClose={() => setShowAlarm(false)} />}
        </header>
    )
}
