import { useState } from 'react'
import { addSchedule } from '../../services/myPageService'

interface AddScheduleModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddScheduleModal({ isOpen, onClose, onSuccess }: AddScheduleModalProps) {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [type, setType] = useState<'personal' | 'academic'>('personal')
    const [color, setColor] = useState('#3B82F6')

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !date) return

        addSchedule({
            title,
            date,
            type,
            color
        })

        setTitle('')
        setDate('')
        setType('personal')
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                        <div className="flex gap-4">
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
                        </div>
                    </div>
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
