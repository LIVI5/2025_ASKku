import { useState, useEffect } from 'react'
import { addSchedule, getTimetableData } from '../../services/myPageService'
import { Timetable, Subject, Schedule } from '../../types'

interface AddScheduleModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddScheduleModal({ isOpen, onClose, onSuccess }: AddScheduleModalProps) {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<Schedule['type']>('personal')
    const [color, setColor] = useState('#3B82F6')

    const [timetables, setTimetables] = useState<Timetable[]>([])
    const [selectedSemester, setSelectedSemester] = useState('')
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [selectedSubject, setSelectedSubject] = useState('')

    useEffect(() => {
        if (isOpen) {
            const sortedTimetables = getTimetableData().sort((a, b) => b.semester.localeCompare(a.semester));
            setTimetables(sortedTimetables);
        }
    }, [isOpen])

    useEffect(() => {
        if (selectedSemester) {
            const timetable = timetables.find((t) => t.semester === selectedSemester)
            setSubjects(timetable ? timetable.subjects : [])
        } else {
            setSubjects([])
        }
        setSelectedSubject('') // Reset subject when semester changes
    }, [selectedSemester, timetables])

    if (!isOpen) return null

    const resetState = () => {
        setTitle('')
        setDate('')
        setDescription('')
        setType('personal')
        setColor('#3B82F6')
        setSelectedSemester('')
        setSelectedSubject('')
        setSubjects([])
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !date) return

        const scheduleData: Omit<Schedule, 'id'> = {
            title,
            date,
            description,
            type,
            color
        }

        if (type === 'subject') {
            scheduleData.semester = selectedSemester
            scheduleData.subject = selectedSubject
        }

        addSchedule(scheduleData)
        resetState()
        onSuccess()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">일정 추가</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                            placeholder="일정 제목을 입력하세요"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                            placeholder="일정에 대한 설명을 입력하세요"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={type === 'personal'}
                                    onChange={() => setType('personal')}
                                    className="text-askku-primary focus:ring-askku-primary"
                                />
                                <span className="text-sm text-gray-700">개인 일정</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={type === 'academic'}
                                    onChange={() => setType('academic')}
                                    className="text-askku-primary focus:ring-askku-primary"
                                />
                                <span className="text-sm text-gray-700">학사 일정</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={type === 'subject'}
                                    onChange={() => setType('subject')}
                                    className="text-askku-primary focus:ring-askku-primary"
                                />
                                <span className="text-sm text-gray-700">과목 일정</span>
                            </label>
                        </div>
                    </div>

                    {type === 'subject' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">학기</label>
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                                >
                                    <option value="">학기 선택 안함</option>
                                    {timetables.map((t) => (
                                        <option key={t.semester} value={t.semester}>
                                            {t.semester}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedSemester && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">과목</label>
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                                    >
                                        <option value="">과목 없음</option>
                                        {subjects.map((s) => (
                                            <option key={s.id} value={s.name}>
                                                {s.name} ({s.professor})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
                        <div className="flex gap-2">
                            {['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'].map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-600' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
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

