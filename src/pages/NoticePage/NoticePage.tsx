import { useState } from 'react'
import { dummyNotices } from '../../data/dummyData'
import NoticeListItem from '../../components/NoticeListItem'
import Pagination from '../../components/Pagination'

export default function NoticePage() {
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState('최신순')
    const [searchQuery, setSearchQuery] = useState('')

    const itemsPerPage = 10
    const totalPages = Math.ceil(dummyNotices.length / itemsPerPage)

    // Filter and sort notices
    let filteredNotices = dummyNotices.filter((notice) =>
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (sortBy === '조회순') {
        filteredNotices = [...filteredNotices].sort((a, b) => b.views - a.views)
    }

    // Paginate
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedNotices = filteredNotices.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div className="max-w-5xl mx-auto p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">총 {filteredNotices.length}개</h1>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary"
                    >
                        <option value="최신순">최신순</option>
                        <option value="조회순">조회순</option>
                    </select>
                </div>

                {/* Search */}
                <div className="relative w-80">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="검색어를 입력하세요"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Notice List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                {paginatedNotices.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        검색 결과가 없습니다.
                    </div>
                ) : (
                    paginatedNotices.map((notice) => (
                        <NoticeListItem key={notice.id} notice={notice} />
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredNotices.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    )
}
