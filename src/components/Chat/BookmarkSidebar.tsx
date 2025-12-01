import { Bookmark } from '../../types'

interface BookmarkSidebarProps {
    bookmarks: Bookmark[]
    onRemove: (id: string) => void
    onClearAll: () => void
}

export default function BookmarkSidebar({ bookmarks, onRemove, onClearAll }: BookmarkSidebarProps) {
    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-gray-800">채팅 보관함</h2>
                    <span className="text-sm text-gray-500">{bookmarks.length}</span>
                </div>
            </div>

            {/* Bookmarks List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {bookmarks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-sm">북마크된 대화가 없습니다</p>
                    </div>
                ) : (
                    bookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-askku-primary transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-xs text-gray-500">
                                    {formatDate(bookmark.timestamp)}
                                </span>
                                <button
                                    onClick={() => onRemove(bookmark.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs font-semibold text-gray-700 mb-1">Q: {bookmark.question}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">A: {bookmark.answer}</p>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    북마크
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Clear All Button */}
            {bookmarks.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={onClearAll}
                        className="w-full py-2.5 bg-askku-primary text-white rounded-lg font-medium hover:bg-askku-secondary transition-colors flex items-center justify-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        전체 삭제
                    </button>
                </div>
            )}
        </div>
    )
}
