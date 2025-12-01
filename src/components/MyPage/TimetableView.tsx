import { useState, useEffect } from 'react'
import { TimetableItem } from '../../types'
import { getTimetables, deleteTimetableItem } from '../../services/myPageService'

interface TimetableViewProps {
    onAddClick: () => void
}

export default function TimetableView({ onAddClick }: TimetableViewProps) {
    const [semester, setSemester] = useState('2025-2')
    const [timetableItems, setTimetableItems] = useState<TimetableItem[]>([])

    useEffect(() => {
        setTimetableItems(getTimetables(semester))
    }, [semester])

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (window.confirm('시간표 항목을 삭제하시겠습니까?')) {
            deleteTimetableItem(id)
            setTimetableItems(getTimetables(semester))
        }
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const dayLabels = ['월요일', '화요일', '수요일', '목요일', '금요일']
    const times = [
        '09:00', '10:00', '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ]

    const getPositionStyle = (item: TimetableItem) => {
        const startHour = parseInt(item.startTime.split(':')[0])
        const startMin = parseInt(item.startTime.split(':')[1])
        const endHour = parseInt(item.endTime.split(':')[0])
        const endMin = parseInt(item.endTime.split(':')[1])

        const startTotalMin = (startHour - 9) * 60 + startMin
        const durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin)

        // 60 minutes = 64px height (approx)
        const top = (startTotalMin / 60) * 64
        const height = (durationMin / 60) * 64

        return { top: `${top}px`, height: `${height}px` }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800">
                        {semester.split('-')[0]}년 {semester.split('-')[1]}학기 시간표
                    </h2>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                    >
                        <option value="2025-1">2025년 1학기</option>
                        <option value="2025-2">2025년 2학기</option>
                    </select>
                </div>
                <button
                    onClick={onAddClick}
                    className="px-4 py-2 bg-askku-primary text-white text-sm font-medium rounded-lg hover:bg-askku-secondary transition-colors flex items-center gap-2"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    시간표 추가
                </button>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] border-b border-gray-200 bg-gray-50">
                        <div className="py-3 text-center text-xs font-medium text-gray-500 border-r border-gray-200">시간</div>
                        {dayLabels.map((day, i) => (
                            <div key={day} className={`py-3 text-center text-sm font-medium text-gray-700 ${i < 4 ? 'border-r border-gray-200' : ''}`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Time Rows */}
                    <div className="relative">
                        {/* Background Grid */}
                        {times.map((time) => (
                            <div key={time} className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] h-16 border-b border-gray-100">
                                <div className="text-xs text-gray-400 text-center pt-2 border-r border-gray-200 bg-gray-50/30">
                                    {time}
                                </div>
                                {[0, 1, 2, 3, 4].map((col) => (
                                    <div key={col} className={`border-r border-gray-100 ${col === 4 ? 'border-r-0' : ''}`}></div>
                                ))}
                            </div>
                        ))}

                        {/* Schedule Items */}
                        <div className="absolute top-0 left-[60px] right-0 bottom-0 grid grid-cols-5 pointer-events-none">
                            {days.map((day) => (
                                <div key={day} className="relative h-full border-r border-transparent">
                                    {timetableItems
                                        .filter(item => item.day === day)
                                        .map(item => (
                                            <div
                                                key={item.id}
                                                className="absolute left-1 right-1 rounded p-2 pointer-events-auto hover:brightness-95 transition-all cursor-pointer shadow-sm border border-black/5 flex flex-col justify-center group"
                                                style={{
                                                    backgroundColor: item.color || '#E5E7EB',
                                                    ...getPositionStyle(item)
                                                }}
                                            >
                                                <div className="font-bold text-xs text-gray-800 truncate">{item.subject}</div>
                                                <div className="text-[10px] text-gray-600 truncate">{item.room}</div>
                                                <button
                                                    onClick={(e) => handleDelete(item.id, e)}
                                                    className="absolute top-1 right-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
