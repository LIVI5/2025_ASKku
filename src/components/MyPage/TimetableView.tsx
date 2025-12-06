import { useState, useEffect } from 'react'
import { getTimetables, deleteTimetableItem } from '../../services/myPageService'
import { TimetableItem } from '../../types'

interface TimetableViewProps {
    onAddClick: () => void
}

const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const weekDayLabels = ['월', '화', '수', '목', '금']

export default function TimetableView({ onAddClick }: TimetableViewProps) {
    const currentSemester = '2025-2' // This could be dynamic
    const [timetable, setTimetable] = useState<TimetableItem[]>([])

    useEffect(() => {
        setTimetable(getTimetables(currentSemester))
    }, [])

    const handleDelete = (id: string) => {
        deleteTimetableItem(id)
        setTimetable(getTimetables(currentSemester)) // Refresh the list
    }

    const getClassForTimeSlot = (day: string, time: string): TimetableItem | undefined => {
        return timetable.find(item => item.day === day && item.startTime === time)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">주간 시간표</h3>
                <button
                    onClick={onAddClick}
                    className="px-4 py-2 bg-askku-primary text-white text-sm font-medium rounded-lg hover:bg-askku-secondary transition-colors flex items-center gap-2"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="relative -top-[1px]">수업 추가</span>
                </button>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                        <tr>
                            <th className="border border-gray-200 bg-gray-50 p-2 text-sm font-semibold text-gray-700 w-20">
                                시간
                            </th>
                            {weekDayLabels.map(day => (
                                <th key={day} className="border border-gray-200 bg-gray-50 p-2 text-sm font-semibold text-gray-700">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(time => (
                            <tr key={time}>
                                <td className="border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600 text-center font-medium">
                                    {time}
                                </td>
                                {weekDays.map((day) => {
                                    const classItem = getClassForTimeSlot(day, time)
                                    return (
                                        <td key={`${day}-${time}`} className="border border-gray-200 p-1 h-16 relative">
                                            {classItem && (
                                                <div
                                                    className="h-full rounded-md p-2 group relative"
                                                    style={{ backgroundColor: classItem.color || '#E5E7EB', borderLeft: `3px solid ${classItem.color || '#9CA3AF'}` }}
                                                >
                                                    <div className="text-xs font-semibold text-gray-800 line-clamp-1">
                                                        {classItem.subject}
                                                    </div>
                                                    <div className="text-xs text-gray-600 line-clamp-1">
                                                        {classItem.room}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDelete(classItem.id)
                                                        }}
                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-sm hover:bg-red-50"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                            <path
                                                                d="M6 18L18 6M6 6l12 12"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}
