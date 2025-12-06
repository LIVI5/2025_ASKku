import { useState, useEffect } from 'react'
import { getUserInformation, saveUserInformation } from '../../services/myPageService'

interface EditInformationModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
}

export default function EditInformationModal({ isOpen, onClose, onSave }: EditInformationModalProps) {
    const [information, setInformation] = useState('')

    useEffect(() => {
        if (isOpen) {
            const currentInformation = getUserInformation()
            setInformation(currentInformation || '')
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        saveUserInformation(information)
        onSave()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">내 정보 관리</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="information" className="block text-sm font-medium text-gray-700 mb-1">
                            내 정보
                        </label>
                        <textarea
                            id="information"
                            value={information}
                            onChange={(e) => setInformation(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary/50"
                            placeholder="자신에 대한 정보를 작성해주세요.
(이 내용은 AI와의 대화에 활용됩니다)"
                        ></textarea>
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
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}