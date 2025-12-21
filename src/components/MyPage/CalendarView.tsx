import { useEffect, useState, useCallback } from 'react'
import { Schedule } from '../../types'
import { deleteScheduleItem, getPrimaryCalendarSchedules } from '../../services/myPageService'

interface CalendarViewProps {
    onAddClick: () => void
    onScheduleClick: (schedule: Schedule) => void
    refreshTrigger: number; // A simple number that increments to trigger reload
}

// Helper to format time (HH:mm)
const formatTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '';
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    const match = timeStr.match(/T(\d{2}:\d{2})/)
    return match ? match[1] : timeStr;
};


export default function CalendarView({ onAddClick, onScheduleClick, refreshTrigger }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [allSchedules, setAllSchedules] = useState<Schedule[]>([]) // Stores all schedules fetched from API
    const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]) // Schedules filtered by type
    const [selectedType, setSelectedType] = useState<'all' | 'personal' | 'academic' | 'course'>('all')

    // Effect to fetch all schedules from the API
    const fetchAllSchedules = useCallback(async () => {
        try {
            const schedulesFromApi = await getPrimaryCalendarSchedules();
            setAllSchedules(schedulesFromApi);
        } catch (error) {
            console.error("Failed to fetch all schedules:", error);
            setAllSchedules([]);
        }
    }, []);

    useEffect(() => {
        fetchAllSchedules();
    }, [fetchAllSchedules, refreshTrigger]); // Re-fetch when refreshTrigger changes

    // Effect to filter schedules based on selectedType
    useEffect(() => {
        if (selectedType === 'all') {
            setFilteredSchedules(allSchedules);
        } else {
            setFilteredSchedules(allSchedules.filter(s => s.type === (selectedType === 'course' ? 'subject' : selectedType)));
        }
    }, [allSchedules, selectedType]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay()
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const handleDeleteSchedule = async (itemID: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await deleteScheduleItem(itemID);
            fetchAllSchedules();
        } catch (error) {
            console.error("Failed to delete schedule:", error);
        }
    }

    const renderCalendar = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const daysInMonth = getDaysInMonth(year, month)
        const firstDay = getFirstDayOfMonth(year, month)
        const days = []

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-gray-100 bg-gray-50/30"></div>)
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            
            // New filtering logic for daySchedules
            const daySchedules = filteredSchedules.filter(s => {
                const startDate = s.startDate || s.date;
                const endDate = s.endDate || startDate;
                const formattedStartDate = startDate ? startDate.substring(0, 10) : '';
                const formattedEndDate = endDate ? endDate.substring(0, 10) : '';

                if (formattedStartDate === formattedEndDate) { // Single day schedule
                    return dateStr === formattedStartDate;
                } else { // Multi-day schedule
                    return dateStr === formattedStartDate || dateStr === formattedEndDate;
                }
            });
            
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

            days.push(
                <div key={day} className={`h-32 border-b border-r border-gray-100 p-2 relative group hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
                    <span className={`text-sm font-medium ${isToday ? 'text-askku-primary bg-blue-100 px-2 py-0.5 rounded-full' : 'text-gray-700'}`}>
                        {day}
                    </span>
                    <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                        {daySchedules.map(schedule => {
                            const startDate = schedule.startDate || schedule.date;
                            const endDate = schedule.endDate || startDate;
                            const formattedStartDate = startDate ? startDate.substring(0, 10) : '';
                            const formattedEndDate = endDate ? endDate.substring(0, 10) : '';
                            
                            let displayTitle = schedule.title;
                            let displayDescription = schedule.description || '';

                            if (formattedStartDate !== formattedEndDate) { // Multi-day
                                if (dateStr === formattedStartDate) {
                                    displayTitle += ' 시작일';
                                    if (schedule.startTime) {
                                        displayDescription = `- 시작 시간: ${formatTime(schedule.startTime)}
${displayDescription}`;
                                    }
                                } else if (dateStr === formattedEndDate) {
                                    displayTitle += ' 마감일';
                                    if (schedule.endTime) {
                                        displayDescription = `- 종료 시간: ${formatTime(schedule.endTime)}
${displayDescription}`;
                                    }
                                }
                            } else { // Single-day
                                if (schedule.startTime) {
                                    displayDescription = `- 시작 시간: ${formatTime(schedule.startTime)}
${displayDescription}`;
                                }
                                if (schedule.endTime && schedule.startTime !== schedule.endTime) { // Only add end time if different from start
                                    displayDescription = `${displayDescription}
- 종료 시간: ${formatTime(schedule.endTime)}`;
                                } else if (schedule.endTime && !schedule.startTime) { // If only end time exists
                                    displayDescription = `- 종료 시간: ${formatTime(schedule.endTime)}
${displayDescription}`;
                                }
                            }


                            return (
                                <div
                                    key={schedule.itemID}
                                    onClick={() => onScheduleClick(schedule)}
                                    className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 flex justify-between items-center group/item"
                                    style={{ backgroundColor: schedule.color || '#E5E7EB', color: '#fff' }}
                                    title={`${displayTitle}\n${displayDescription || ''}`} // Use displayTitle and displayDescription for title attribute
                                >
                                    <span className="truncate">{displayTitle}</span> {/* Use displayTitle */}
                                    <button
                                        onClick={(e) => handleDeleteSchedule(schedule.itemID, e)}
                                        className="opacity-0 group-hover/item:opacity-100 ml-1 hover:text-red-200"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )
        }

        return days
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800">
                        {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </h2>
                    <div className="flex gap-1">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="text-sm text-gray-500 hover:text-askku-primary ml-2">
                            오늘
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-sm text-gray-700">
                        {['all', 'personal', 'academic', 'course'].map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type === 'course' ? 'course' : (type as any))}
                                className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 font-medium transition-colors ${selectedType === type
                                    ? 'bg-white text-askku-primary shadow'
                                    : 'hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {type === 'all' ? '전체' : type === 'personal' ? '개인' : type === 'academic' ? '학사' : '과목'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={onAddClick}
                        className="px-4 py-2 bg-askku-primary text-white text-sm font-medium rounded-lg hover:bg-askku-secondary transition-colors flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span className="relative -top-[1px]">일정 추가</span>
                    </button>
                </div>
            </div>

            {/* Weekday Headers */}

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-r border-gray-200 bg-gray-50">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div key={day} className={`py-2 text-center text-sm font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {renderCalendar()}
            </div>
        </div>
    );
}
