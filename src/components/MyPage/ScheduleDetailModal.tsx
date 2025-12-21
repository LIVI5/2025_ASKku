import { Schedule } from '../../types'

interface ScheduleDetailModalProps {
    isOpen: boolean
    onClose: () => void
    schedule: Schedule | null
}

export default function ScheduleDetailModal({ isOpen, onClose, schedule }: ScheduleDetailModalProps) {
    if (!isOpen || !schedule) return null

    const typeToKorean: Record<Schedule['type'], string> = {
        personal: '개인 일정',
        academic: '학사 일정',
        subject: '과목 일정',
        event: '이벤트',
        other: '기타'
    }

    // 날짜 포맷 함수
    const formatDate = (dateStr: string | undefined): string => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // 시간 포맷 함수
    const formatTime = (timeStr: string | undefined): string => {
        if (!timeStr) return ''
        // HH:mm 형식이면 그대로 반환
        if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr
        // ISO 형식이면 시간 부분만 추출
        const match = timeStr.match(/T(\d{2}:\d{2})/)
        return match ? match[1] : timeStr
    }

    const startDate = formatDate(schedule.startDate || schedule.date)
    const endDate = formatDate(schedule.endDate || schedule.date)
    const sameDay = startDate === endDate

    const dateRange = sameDay ? startDate : `${startDate} ~ ${endDate}`

    let timeRange = ''
    if (schedule.allDay) {
        timeRange = '하루종일'
    } else {
        const startTime = formatTime(schedule.startTime)
        const endTime = formatTime(schedule.endTime)
        if (startTime && endTime) {
            timeRange = `${startTime} - ${endTime}`
        } else if (startTime) {
            timeRange = startTime
        } else if (endTime) {
            timeRange = `~ ${endTime}`
        }
    }

    // Determine the type display text
    const typeDisplayText = schedule.type === 'subject'
        ? `${typeToKorean[schedule.type]} - ${schedule.courseName || '과목 없음'}`
        : typeToKorean[schedule.type];


    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800" style={{ color: schedule.color }}>{schedule.title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">날짜</label>
                        <p className="text-gray-800">{dateRange}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">시간</label>
                        <p className="text-gray-800">{timeRange || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">유형</label>
                        <p className="text-gray-800">{typeDisplayText}</p> {/* Use typeDisplayText */}
                    </div>

                    {schedule.location && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500">장소</label>
                            <p className="text-gray-800">{schedule.location}</p>
                        </div>
                    )}
                    {schedule.description && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500">설명</label>
                            <p className="text-gray-800 whitespace-pre-wrap">{schedule.description}</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    )
}
