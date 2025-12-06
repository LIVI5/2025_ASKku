import { ChatMessage as ChatMessageType } from '../../types'
import logoImage from '../../assets/logo_nonbg.svg'

interface ChatMessageProps {
    message: ChatMessageType
    onBookmark?: (messageId: string) => void
    onScheduleExtract?: (messageId: string) => void
    onTranslate?: (content: string) => void
}

export default function ChatMessage({ message, onBookmark, onScheduleExtract, onTranslate }: ChatMessageProps) {
    const isUser = message.role === 'user'
    const time = new Date(message.timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex gap-3 max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isUser && (
                    <div className="w-10 h-10 rounded-full bg-askku-primary flex items-center justify-center flex-shrink-0">
                        <img src={logoImage} alt="ASKku Bot" className="w-6 h-6 object-contain" />
                    </div>
                )}

                <div className="flex flex-col">
                    <div
                        className={`px-4 py-3 rounded-lg ${isUser
                            ? 'bg-askku-primary text-white'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-gray-500">{time}</span>
                        {!isUser && onBookmark && (
                            <button
                                onClick={() => onBookmark(message.id)}
                                className={`text-xs px-2 py-0.5 rounded transition-colors ${message.isBookmarked
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {message.isBookmarked ? '북마크됨' : '북마크'}
                            </button>
                        )}
                        {!isUser && onTranslate && (
                            <button
                                onClick={() => onTranslate(message.content)}
                                className="text-xs px-2 py-0.5 rounded transition-colors text-gray-500 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-1"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                </svg>
                                Translate
                            </button>
                        )}
                        {!isUser && onScheduleExtract && (
                            <button
                                onClick={() => onScheduleExtract(message.id)}
                                className="text-xs px-2 py-0.5 rounded transition-colors text-gray-500 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-1"
                                title="일정 추출"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 1.99 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" fill="currentColor" />
                                </svg>
                                일정
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
