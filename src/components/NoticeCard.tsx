import { Notice } from '../types'

interface NoticeCardProps {
    notice: Notice
}

export default function NoticeCard({ notice }: NoticeCardProps) {
    // 출처별 설정 (아이콘, 색상, 배경 등)
    const getSourceConfig = (source: string) => {
        const configs: Record<string, {
            icon: string
            bg: string
            border: string
            accent: string
            text: string
        }> = {
            '소프트웨어융합대학': {
                icon: '🏛️',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                accent: 'bg-blue-500',
                text: 'text-blue-700'
            },
            '소프트웨어학과': {
                icon: '💻',
                bg: 'bg-green-50',
                border: 'border-green-200',
                accent: 'bg-green-500',
                text: 'text-green-700'
            },
            '글로벌융합학부': {
                icon: '🌐',
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                accent: 'bg-purple-500',
                text: 'text-purple-700'
            },
            '학사지원팀': {
                icon: '📋',
                bg: 'bg-orange-50',
                border: 'border-orange-200',
                accent: 'bg-orange-500',
                text: 'text-orange-700'
            },
            '컴퓨터공학과': {
                icon: '⚙️',
                bg: 'bg-cyan-50',
                border: 'border-cyan-200',
                accent: 'bg-cyan-500',
                text: 'text-cyan-700'
            },
            '생활관': {
                icon: '🏠',
                bg: 'bg-rose-50',
                border: 'border-rose-200',
                accent: 'bg-rose-500',
                text: 'text-rose-700'
            },
            '정보통신처': {
                icon: '🔧',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                accent: 'bg-indigo-500',
                text: 'text-indigo-700'
            }
        }

        // 기본 설정 (매칭되지 않는 출처)
        return configs[source] || {
            icon: '📢',
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            accent: 'bg-gray-500',
            text: 'text-gray-700'
        }
    }

    const config = getSourceConfig(notice.source)

    const handleClick = () => {
        if (notice.url) {
            window.open(notice.url, '_blank')
        }
    }

    return (
        <div
            onClick={handleClick}
            className={`${config.bg} border-2 ${config.border} rounded-xl p-5 
                hover:-translate-y-1 hover:shadow-xl transition-all duration-300 
                cursor-pointer group relative overflow-hidden`}
        >
            {/* Accent bar (호버 시 애니메이션) */}
            <div
                className={`absolute bottom-0 left-0 h-1 ${config.accent} 
                    w-0 group-hover:w-full transition-all duration-500 ease-out`}
            />

            {/* Content */}
            <div className="flex items-start gap-3">
                {/* 아이콘 */}
                <span className="text-3xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                    {config.icon}
                </span>

                {/* 제목, 출처, 날짜 */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-2 mb-2">
                        {notice.title}
                    </h3>
                    <div className="flex justify-between items-center mt-2 text-xs">
                        <span className={`font-semibold ${config.text} inline-block px-2 py-1 rounded-full ${config.bg}`}>
                            {notice.source}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-60">
                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {notice.date}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
