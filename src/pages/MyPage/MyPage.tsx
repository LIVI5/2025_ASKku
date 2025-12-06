import { useState } from 'react'
import CalendarView from '../../components/MyPage/CalendarView'
import TimetableView from '../../components/MyPage/TimetableView'
import AddScheduleModal from '../../components/MyPage/AddScheduleModal'
import AddTimetableModal from '../../components/MyPage/AddTimetableModal'
import EditInformationModal from '../../components/MyPage/EditInformationModal'
import ScheduleDetailModal from '../../components/MyPage/ScheduleDetailModal'
import { Schedule } from '../../types'

export default function MyPage() {
    const [view, setView] = useState<'calendar' | 'timetable'>('calendar')
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false)
    const [isEditInformationModalOpen, setIsEditInformationModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
    const [refreshKey, setRefreshKey] = useState(0) // Force re-render on data change

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1)
    }

    const handleScheduleClick = (schedule: Schedule) => {
        setSelectedSchedule(schedule)
        setIsDetailModalOpen(true)
    }

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false)
        setSelectedSchedule(null)
    }

    return (
        <div className="flex-1 bg-gray-50 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            {/* Header */}
            <div className="bg-white border-b border-gray-200 h-[72px] px-6 flex items-center justify-between flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-800">마이페이지</h1>
                <button
                    onClick={() => setIsEditInformationModalOpen(true)}
                    className="px-4 py-2 bg-askku-primary text-white rounded-lg hover:bg-askku-secondary transition-colors"
                >
                    내 정보 관리
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
                    <div key={refreshKey}>
                        {view === 'calendar' ? (
                            <CalendarView
                                onAddClick={() => setIsScheduleModalOpen(true)}
                                onScheduleClick={handleScheduleClick}
                            />
                        ) : (
                            <TimetableView onAddClick={() => setIsTimetableModalOpen(true)} />
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSuccess={handleRefresh}
            />
            <AddTimetableModal
                isOpen={isTimetableModalOpen}
                onClose={() => setIsTimetableModalOpen(false)}
                onSuccess={handleRefresh}
            />
            <EditInformationModal
                isOpen={isEditInformationModalOpen}
                onClose={() => setIsEditInformationModalOpen(false)}
                onSave={handleRefresh}
            />
            <ScheduleDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                schedule={selectedSchedule}
            />
        </div>
    )
}
