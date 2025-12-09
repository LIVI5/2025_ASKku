import { useState } from 'react'
import { Bookmark } from '../../types'
import BookmarkDetailModal from './BookmarkDetailModal'

interface BookmarkSidebarProps {
    bookmarks: Bookmark[]
    onRemove: (id: string) => void
    onClearAll: () => void
}

export default function BookmarkSidebar({ bookmarks, onRemove, onClearAll }: BookmarkSidebarProps) {
    const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null)

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

    const handleBookmarkClick = (bookmark: Bookmark) => {
        setSelectedBookmark(bookmark)
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
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 text-gray-300">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <p className="text-sm">북마크된 대화가 없습니다</p>
                    </div>
                ) : (
                    bookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-askku-primary hover:shadow-sm transition-all cursor-pointer group"
                            onClick={() => handleBookmarkClick(bookmark)}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-xs text-gray-500">
                                    {formatDate(bookmark.timestamp)}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onRemove(bookmark.id)
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    title="삭제"
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

                            {/* Title */}
                            <div className="flex items-start gap-2 mb-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500 flex-shrink-0 mt-0.5">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">
                                    {bookmark.title || bookmark.question.substring(0, 30) + '...'}
                                </h3>
                            </div>

                            {/* Preview */}
                            <p className="text-xs text-gray-500 line-clamp-2 pl-6">
                                {bookmark.question}
                            </p>

                            {/* Click indicator */}
                            <div className="flex items-center justify-end mt-2 text-xs text-askku-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="mr-1">자세히 보기</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {selectedBookmark && (
                <BookmarkDetailModal
                    isOpen={!!selectedBookmark}
                    onClose={() => setSelectedBookmark(null)}
                    title={selectedBookmark.title || '북마크 상세'}
                    question={selectedBookmark.question}
                    answer={selectedBookmark.answer}
                />
            )}

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