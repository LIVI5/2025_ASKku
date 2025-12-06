import { useState } from 'react'
import { addTimetableItem } from '../../services/myPageService'

interface AddTimetableModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddTimetableModal({ isOpen, onClose, onSuccess }: AddTimetableModalProps) {
    const [subject, setSubject] = useState('')
    const [room, setRoom] = useState('')
    const [day, setDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon')
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('10:30')
    const [color, setColor] = useState('#DBEAFE')
    const [alias, setAlias] = useState('')

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject || !room) return

        addTimetableItem({
            subject,
            room,
            day,
            startTime,
            endTime,
            color,
            alias
        })

        setSubject('')
        setRoom('')
        setDay('Mon')
        setStartTime('09:00')
        setEndTime('10:30')
        setAlias('')
        onSuccess()
        onClose()
    }

    const colors = [
        { label: 'Blue', value: '#DBEAFE' },
        { label: 'Green', value: '#DCFCE7' },
        { label: 'Purple', value: '#F3E8FF' },
        { label: 'Amber', value: '#FEF3C7' },
        { label: 'Red', value: '#FEE2E2' },
    ]

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">시간표 추가</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">과목명</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                            placeholder="예: 데이터베이스개론"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">별칭 (선택)</label>
                        <input
                            type="text"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                            placeholder="예: 데베개"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">강의실</label>
                        <input
                            type="text"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                            placeholder="예: 공학관 301호"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">요일</label>
                            <select
                                value={day}
                                onChange={(e) => setDay(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                            >
                                <option value="Mon">월요일</option>
                                <option value="Tue">화요일</option>
                                <option value="Wed">수요일</option>
                                <option value="Thu">목요일</option>
                                <option value="Fri">금요일</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
                        <div className="flex gap-2">
                            {colors.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-8 h-8 rounded-full border-2 ${color === c.value ? 'border-gray-600' : 'border-transparent'}`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-askku-primary text-white rounded-lg hover:bg-askku-secondary transition-colors"
                        >
                            추가
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
