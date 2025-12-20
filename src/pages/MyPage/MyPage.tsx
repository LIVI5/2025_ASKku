import { useState, useEffect } from 'react'
import CalendarView from '../../components/MyPage/CalendarView'
import TimetableView from '../../components/MyPage/TimetableView'
import AddScheduleModal from '../../components/MyPage/AddScheduleModal'
import AddCourseModal from '../../components/MyPage/AddCourseModal'
import EditChatSettingsModal from '../../components/MyPage/EditChatSettingsModal'
import ScheduleDetailModal from '../../components/MyPage/ScheduleDetailModal'
import { Schedule, TimetableItem } from '../../types'
import { getTimetable, deleteTimetableItem } from '../../services/myPageService'

export default function MyPage() {
    const [view, setView] = useState<'calendar' | 'timetable'>('calendar')
    
    // Modal states
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false)
    const [isEditChatSettingsModalOpen, setIsEditChatSettingsModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    
    // Schedule-related state
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
    const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0)

    // Timetable-related state
    const [timetableItems, setTimetableItems] = useState<TimetableItem[]>([]);
    const [isTimetableLoading, setIsTimetableLoading] = useState<boolean>(false);
    const [timetableError, setTimetableError] = useState<string | null>(null);

    const fetchTimetableData = async () => {
        try {
            setIsTimetableLoading(true);
            setTimetableError(null);
            const fetchedTimetable = await getTimetable();
            setTimetableItems(fetchedTimetable.items || []);
        } catch (err) {
            setTimetableError('시간표를 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setIsTimetableLoading(false);
        }
    };

    // Fetch timetable data when the view is switched to 'timetable'
    useEffect(() => {
        if (view === 'timetable') {
            fetchTimetableData();
        }
    }, [view]);


    const handleScheduleRefresh = () => {
        setScheduleRefreshKey(prev => prev + 1)
    }

    const handleScheduleClick = (schedule: Schedule) => {
        setSelectedSchedule(schedule)
        setIsDetailModalOpen(true)
    }

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false)
        setSelectedSchedule(null)
    }
    
    const handleAddItem = (newItem: TimetableItem) => {
        // Re-fetch the entire list to ensure consistency and avoid subtle state bugs
        fetchTimetableData();
    };

    const handleDeleteItem = async (id: number) => {
        try {
            await deleteTimetableItem(id);
            setTimetableItems(prevItems => prevItems.filter(item => item.itemID !== id));
        } catch (err) {
            console.error('Failed to delete timetable item:', err);
            alert('수업 삭제에 실패했습니다.');
        }
    };

    const renderMainView = () => {
        if (view === 'calendar') {
            return (
                <div key={scheduleRefreshKey}>
                    <CalendarView
                        onAddClick={() => setIsScheduleModalOpen(true)}
                        onScheduleClick={handleScheduleClick}
                    />
                </div>
            )
        }

        if (view === 'timetable') {
            if (isTimetableLoading) {
                 return (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-center items-center" style={{minHeight: '400px'}}>
                        <p className="text-gray-500">시간표를 불러오는 중입니다...</p>
                    </div>
                );
            }
            if (timetableError) {
                return (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-center items-center" style={{minHeight: '400px'}}>
                        <p className="text-red-500">{timetableError}</p>
                    </div>
                );
            }
            return (
                <TimetableView 
                    items={timetableItems}
                    onAddClick={() => setIsTimetableModalOpen(true)}
                    onDeleteItem={handleDeleteItem}
                />
            );
        }
        return null;
    }

    return (
        <div className="flex-1 bg-gray-50 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 h-[72px] px-6 flex items-center justify-between flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-800">마이페이지</h1>
                <button
                    onClick={() => setIsEditChatSettingsModalOpen(true)}
                    className="px-4 py-2 bg-askku-primary text-white text-sm font-medium rounded-lg hover:bg-askku-secondary transition-colors"
                >
                    대화 설정 관리
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Page Title & View Switcher */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {view === 'calendar' ? '캘린더' : '시간표'}
                        </h2>
                        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                            <button
                                onClick={() => setView('calendar')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'calendar'
                                    ? 'bg-askku-primary text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                캘린더 보기
                            </button>
                            <button
                                onClick={() => setView('timetable')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'timetable'
                                    ? 'bg-askku-primary text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                시간표 보기
                            </button>
                        </div>
                    </div>

                    {/* Main View */}
                    {renderMainView()}
                </div>
            </div>

            {/* Modals */}
            <AddScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSuccess={handleScheduleRefresh}
            />
            <AddCourseModal
                isOpen={isTimetableModalOpen}
                onClose={() => setIsTimetableModalOpen(false)}
                onSuccess={handleAddItem}
            />
            <EditChatSettingsModal
                isOpen={isEditChatSettingsModalOpen}
                onClose={() => setIsEditChatSettingsModalOpen(false)}
                onSave={handleScheduleRefresh} // Assuming this might refresh schedule view
            />
            <ScheduleDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                schedule={selectedSchedule}
            />
        </div>
    )
}
