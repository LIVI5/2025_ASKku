import { useEffect, useRef } from 'react'
import { dummyNotices } from '../data/dummyData'
import { getNewNotices } from '../utils/localStorage'

interface AlarmModalProps {
    onClose: () => void
}

export default function AlarmModal({ onClose }: AlarmModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)
    const newNotices = getNewNotices(dummyNotices).slice(0, 5) // 최대 5개만 표시

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-md max-h-[600px] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">알람</h2>
                    <p className="text-sm text-gray-600">최근 업데이트를 한눈에 확인해보세요!</p>
                </div>

                {/* Notice List */}
                <div className="overflow-y-auto max-h-[450px]">
                    {newNotices.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>새로운 공지사항이 없습니다.</p>
                        </div>
                    ) : (
                        newNotices.map((notice) => (
                            <div
                                key={notice.id}
                                className="p-6 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span
                                        className={`text-xs font-semibold px-2 py-1 rounded ${notice.category === '긴급'
                                                ? 'bg-red-100 text-red-700'
                                                : notice.category === '학사'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : notice.category === '행사'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : notice.category === '사업'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {notice.category}
                                    </span>
                                    <span className="text-xs text-gray-500">{notice.date}</span>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">{notice.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">{notice.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
