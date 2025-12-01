import { ChatMessage as ChatMessageType } from '../../types'

interface ChatMessageProps {
    message: ChatMessageType
    onBookmark?: (messageId: string) => void
}

export default function ChatMessage({ message, onBookmark }: ChatMessageProps) {
    const isUser = message.role === 'user'
    const time = new Date(message.timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex gap-3 max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!isUser && (
                    <div className="w-10 h-10 rounded-full bg-askku-primary flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                )}

                {/* Message Content */}
                <div className="flex flex-col">
                    <div
                        className={`px-4 py-3 rounded-lg ${isUser
                                ? 'bg-askku-primary text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Timestamp and Bookmark */}
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
                                {message.isBookmarked ? '★ 북마크됨' : '☆ 북마크'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
