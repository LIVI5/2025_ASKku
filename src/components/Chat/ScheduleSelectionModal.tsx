import { useEffect, useState } from 'react'
import { ExtractedSchedule } from '../../types'

interface ScheduleSelectionModalProps {
    isOpen: boolean
    isLoading: boolean
    schedules: ExtractedSchedule[]
    onClose: () => void
    onConfirm: (selected: ExtractedSchedule[]) => void
}

export default function ScheduleSelectionModal({ isOpen, isLoading, schedules, onClose, onConfirm }: ScheduleSelectionModalProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    useEffect(() => {
        // 모달이 열릴 때 선택 초기화 (자동 선택 제거)
        if (isOpen) {
            setSelectedIds([])
        }
    }, [isOpen])

    if (!isOpen) return null

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
    }

    const handleConfirm = () => {
        const selected = schedules.filter(s => selectedIds.includes(s.id))
        onConfirm(selected)
    }

    // 날짜 포맷 함수
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const renderPeriod = (schedule: ExtractedSchedule) => {
        const startDate = formatDate(schedule.startDate)
        const endDate = formatDate(schedule.endDate)
        const sameDay = startDate === endDate

        // 같은 날인 경우
        if (sameDay) {
            return startDate
        }

        // 기간인 경우 (다른 날)
        return `${startDate} ~ ${endDate}`
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
                <div className="bg-askku-primary px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" fill="currentColor" />
                        </svg>
                        일정 추가
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                            <div className="flex gap-2">
                                <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <p className="text-sm">일정 정보를 불러오는 중입니다...</p>
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            <p className="font-medium mb-2">추출된 일정이 없습니다.</p>
                            <p className="text-sm">답변에 일정 정보가 없다면 다른 질문으로 다시 시도해 보세요.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {schedules.map(schedule => (
                                <div
                                    key={schedule.id}
                                    onClick={() => toggleSelect(schedule.id)}
                                    className="flex items-start gap-3 border border-gray-200 rounded-lg p-4 hover:border-askku-primary/60 transition-colors cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(schedule.id)}
                                        readOnly
                                        className="mt-1 w-4 h-4 text-askku-primary focus:ring-askku-primary pointer-events-none"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-800">{schedule.title || '제목 없음'}</p>
                                            {schedule.location && (
                                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                    {schedule.location}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{renderPeriod(schedule)}</p>
                                        {schedule.description && (
                                            <p className="text-xs text-gray-500 mt-2 whitespace-pre-wrap">{schedule.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        닫기
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || selectedIds.length === 0}
                        className="px-4 py-2 bg-askku-primary text-white rounded-lg hover:bg-askku-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        선택 일정 추가
                    </button>
                </div>
            </div>
        </div>
    )
}
