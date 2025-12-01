import { Notice } from '../types'

interface NoticeCardProps {
    notice: Notice
}

export default function NoticeCard({ notice }: NoticeCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
                <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${notice.category === '긴급'
                            ? 'bg-red-100 text-red-700'
                            : notice.category === '학사'
                                ? 'bg-blue-100 text-blue-700'
                                : notice.category === '행사'
                                    ? 'bg-purple-100 text-purple-700'
                                    : notice.category === '사업'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                        }`}
                >
                    {notice.category}
                </span>
                <span className="text-xs text-gray-500">{notice.date}</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{notice.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{notice.content}</p>
        </div>
    )
}
