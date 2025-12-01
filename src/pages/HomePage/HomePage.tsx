import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dummyNotices } from '../../data/dummyData'
import NoticeCard from '../../components/NoticeCard'

export default function HomePage() {
    const navigate = useNavigate()
    const [activeCategory, setActiveCategory] = useState('전체')
    const categories = ['수강신청', '학사일정', '장학금', '기숙사']

    // 최신 공지사항 6개
    const latestNotices = dummyNotices.slice(0, 6)

    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* Title Section */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">성균관대 정보 검색</h1>
                <p className="text-gray-600">학사, 정보, 공지사항, 강의 정보를 검색해보세요</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요..."
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-askku-primary focus:border-transparent text-lg"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-askku-primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex justify-center gap-4 mb-12">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-6 py-2 rounded-full font-medium transition-colors ${activeCategory === category
                                ? 'bg-askku-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Latest Notices Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">최신 공지사항</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {latestNotices.map((notice) => (
                        <NoticeCard key={notice.id} notice={notice} />
                    ))}
                </div>

                {/* More Button */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/notices')}
                        className="px-8 py-3 border-2 border-askku-primary text-askku-primary rounded-lg font-medium hover:bg-askku-primary hover:text-white transition-colors"
                    >
                        더 많은 공지사항 보기
                    </button>
                </div>
            </div>
        </div>
    )
}
