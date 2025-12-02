import { useEffect, useRef } from 'react'

interface SummaryModalProps {
    isOpen: boolean
    onClose: () => void
    content: string
}

export default function SummaryModal({ isOpen, onClose, content }: SummaryModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fade-in-up"
            >
                {/* Header */}
                <div className="bg-askku-primary px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
                        </svg>
                        요약 내용
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {content}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    )
}
