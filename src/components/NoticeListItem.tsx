import { Notice } from '../types'

interface NoticeListItemProps {
    notice: Notice
}

export default function NoticeListItem({ notice }: NoticeListItemProps) {
    return (
        <div className="bg-white border-b border-gray-200 p-6 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
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
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{notice.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{notice.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{notice.date}</span>
                        <span className="flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            {notice.views.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Action Icons */}
                <div className="flex flex-col gap-2 ml-4">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                            <path
                                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
