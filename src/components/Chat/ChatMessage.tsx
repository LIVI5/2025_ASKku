import { ChatMessage as ChatMessageType } from '../../types'
import logoImage from '../../assets/logo_nonbg.svg'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkBreaks from 'remark-breaks'

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
                        <div className={`text-sm markdown-content ${isUser ? 'text-white' : 'text-gray-800'}`}>
                            {/* 로딩 중일 때 로딩 인디케이터 표시 */}
                            {message.isLoading ? (
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                                </div>
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                    components={{
                                        // 리스트 스타일 커스터마이징
                                        ul: ({ node, ...props }) => (
                                            <ul className="list-disc list-inside space-y-1 my-2" {...props} />
                                        ),
                                        ol: ({ node, ...props }) => (
                                            <ol className="list-decimal list-inside space-y-1 my-2" {...props} />
                                        ),
                                        li: ({ node, ...props }) => (
                                            <li className="ml-2" {...props} />
                                        ),
                                        // 헤딩 스타일
                                        h1: ({ node, ...props }) => (
                                            <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
                                        ),
                                        h2: ({ node, ...props }) => (
                                            <h2 className="text-lg font-bold mt-3 mb-2" {...props} />
                                        ),
                                        h3: ({ node, ...props }) => (
                                            <h3 className="text-base font-bold mt-2 mb-1" {...props} />
                                        ),
                                        // 코드 블록
                                        code: ({ node, inline, ...props }: any) => (
                                            inline
                                                ? <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props} />
                                                : <code className="block bg-gray-200 p-2 rounded my-2 text-sm" {...props} />
                                        ),
                                        // 강조
                                        strong: ({ node, ...props }) => (
                                            <strong className="font-bold" {...props} />
                                        ),
                                        // 링크
                                        a: ({ node, ...props }) => (
                                            <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                                        ),
                                        // 문단
                                        p: ({ node, ...props }) => (
                                            <p className="my-1" {...props} />
                                        )
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-gray-500">{time}</span>
                        {!isUser && onBookmark && (
                            <button
                                onClick={() => onBookmark(message.id)}
                                className={`text-xs px-2 py-0.5 rounded transition-colors inline-flex items-center gap-1 ${message.isBookmarked
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill={message.isBookmarked ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                {message.isBookmarked ? '북마크됨' : '북마크'}
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
                        {!isUser && onTranslate && (
                            <button
                                onClick={() => onTranslate(message.content)}
                                className="text-xs px-2 py-0.5 rounded transition-colors text-gray-500 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-1"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                </svg>
                                번역
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}