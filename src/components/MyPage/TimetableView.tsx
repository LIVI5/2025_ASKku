import { Fragment } from 'react'
import { TimetableItem } from '../../types'

interface TimetableViewProps {
    onAddClick: () => void;
    items: TimetableItem[];
    onDeleteItem: (id: number) => void;
}

const HOUR_HEIGHT = 64; // Height of one hour slot in pixels (e.g., 64px for h-16 equivalent)
const MINUTES_IN_HOUR = 60;
const weekDays = ['월', '화', '수', '목', '금'];

const getTimeInMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * MINUTES_IN_HOUR + minutes;
};


export default function TimetableView({ onAddClick, items = [], onDeleteItem }: TimetableViewProps) {
    
    // --- Dynamic Timetable Hours Logic ---
    const TIMETABLE_START_HOUR = 9; // 09:00

    // Check if there are any classes ending after 6 PM
    const hasLateClasses = items.some(item => getTimeInMinutes(item.endTime) > 18 * 60);
    
    // Set end hour to 10 PM if there are late classes, otherwise 6 PM
    const TIMETABLE_END_HOUR = hasLateClasses ? 21 : 18;

    const hourLabels = Array.from({ length: TIMETABLE_END_HOUR - TIMETABLE_START_HOUR + 1 }, (_, i) => {
        const hour = TIMETABLE_START_HOUR + i;
        return `${hour.toString().padStart(2, '0')}:00`;
    });
    // --- End Dynamic Logic ---

    const calculateEventStyles = (item: TimetableItem) => {
        const startMinutes = getTimeInMinutes(item.startTime);
        const endMinutes = getTimeInMinutes(item.endTime);
        const durationMinutes = endMinutes - startMinutes;
    
        const timetableStartMinutes = TIMETABLE_START_HOUR * MINUTES_IN_HOUR;
    
        const top = ((startMinutes - timetableStartMinutes) / MINUTES_IN_HOUR) * HOUR_HEIGHT;
        const height = (durationMinutes / MINUTES_IN_HOUR) * HOUR_HEIGHT;
    
        return {
            top: `${top}px`,
            height: `${height}px`,
            position: 'absolute',
            left: '0',
            right: '0',
        };
    };

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

            {/* Timetable Grid and Events */}
            <div className="overflow-x-auto relative">
                <div className="grid border-collapse" style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
                    {/* Headers */}
                    <div className="border border-gray-200 bg-gray-50 p-2 text-sm font-semibold text-gray-700 text-center">
                        시간
                    </div>
                    {weekDays.map(day => (
                        <div key={day} className="border border-gray-200 bg-gray-50 p-2 text-sm font-semibold text-gray-700 text-center">
                            {day}
                        </div>
                    ))}

                    {/* Time labels and Day Grid Cells */}
                    {hourLabels.map((hour) => (
                        <Fragment key={hour}>
                            <div
                                key={`time-${hour}`}
                                className="border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600 text-center font-medium relative"
                                style={{ height: `${HOUR_HEIGHT}px` }}
                            >
                                {hour}
                            </div>
                            {weekDays.map((day) => (
                                <div
                                    key={`${day}-grid-cell-${hour}`}
                                    className="border border-gray-200 p-1"
                                    style={{ height: `${HOUR_HEIGHT}px` }}
                                >
                                    {/* These are just grid cells for visual lines */}
                                </div>
                            ))}
                        </Fragment>
                    ))}
                </div>

                {/* Absolute positioned events layer */}
                <div
                    className="absolute top-[37.5px] left-[80px] right-0 bottom-0 grid" // Header height adjusted to 37.5px
                    style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
                >
                    {weekDays.map((day) => (
                        <div key={`events-column-${day}`} className="relative h-full">
                            {items
                                .filter(item => item.dayOfWeek === day)
                                .map(item => (
                                    <div
                                        key={item.itemID}
                                        className="group relative text-gray-800 border border-gray-200 px-1 py-2"
                                        style={{ ...calculateEventStyles(item), backgroundColor: item.color || '#DBEAFE' }}
                                    >
                                        <div className="text-xs font-semibold line-clamp-1">
                                            {item.courseName}
                                        </div>
                                        <div className="text-xs line-clamp-1">
                                            {item.location}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteItem(item.itemID);
                                            }}
                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-sm hover:bg-red-50 text-gray-700"
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
                                ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}