import { useState, useEffect, useRef } from 'react'
import ChatMessage from '../../components/Chat/ChatMessage'
import ChatInput from '../../components/Chat/ChatInput'
import BookmarkSidebar from '../../components/Chat/BookmarkSidebar'
import {
    getCurrentSession,
    createNewSession,
    addMessage,
    generateAIResponse,
    toggleMessageBookmark,
    getBookmarks,
    removeBookmark,
    clearAllBookmarks,
    clearSession
} from '../../services/chatService'
import { ChatMessage as ChatMessageType } from '../../types'
import logoImage from '../../assets/logo_nonbg.svg'

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessageType[]>([])
    const [bookmarks, setBookmarks] = useState(getBookmarks())
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load session on mount
    useEffect(() => {
        let session = getCurrentSession()
        if (!session) {
            session = createNewSession()
        }
        setMessages(session.messages)
    }, [])

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async (content: string) => {
        // Add user message
        const userMessage = addMessage(content, 'user')
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
            // Generate AI response
            const aiResponse = await generateAIResponse(content)
            const aiMessage = addMessage(aiResponse, 'assistant')
            setMessages(prev => [...prev, aiMessage])
        } catch (error) {
            console.error('Error generating AI response:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBookmark = (messageId: string) => {
        toggleMessageBookmark(messageId)
        const session = getCurrentSession()
        if (session) {
            setMessages([...session.messages])
        }
        setBookmarks(getBookmarks())
    }

    const handleRemoveBookmark = (bookmarkId: string) => {
        removeBookmark(bookmarkId)
        setBookmarks(getBookmarks())
        // Update messages to reflect bookmark removal
        const session = getCurrentSession()
        if (session) {
            setMessages([...session.messages])
        }
    }

    const handleClearAllBookmarks = () => {
        if (window.confirm('모든 북마크를 삭제하시겠습니까?')) {
            clearAllBookmarks()
            setBookmarks([])
            // Update messages to reflect all bookmarks cleared
            const session = getCurrentSession()
            if (session) {
                setMessages([...session.messages])
            }
        }
    }

    const handleNewChat = () => {
        clearSession()
        const newSession = createNewSession()
        setMessages(newSession.messages)
        setIsLoading(false)
    }

    return (
        <div className="flex h-screen">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 h-[72px] px-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">채팅</h1>
                    <button
                        onClick={handleNewChat}
                        className="px-4 py-2 bg-askku-primary text-white rounded-lg font-medium hover:bg-askku-secondary transition-colors flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 5v14M5 12h14"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        New Chat
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {messages.length === 0 ? (
                        // Empty State
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 rounded-full bg-askku-primary flex items-center justify-center mb-4">
                                <img src={logoImage} alt="ASKku Logo" className="w-10 h-10 object-contain" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">무엇을 도와드릴까요?</h2>
                            <p className="text-gray-500">학과와 관련된 정보 아무거나 물어보세요!</p>
                        </div>
                    ) : (
                        <>
                            <div className="max-w-4xl mx-auto">
                                <p className="text-center text-sm text-gray-500 mb-6">Chat with Assistant</p>
                                {messages.map((message) => (
                                    <ChatMessage
                                        key={message.id}
                                        message={message}
                                        onBookmark={handleBookmark}
                                    />
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start mb-4">
                                        <div className="flex gap-3 max-w-[70%]">
                                            <div className="w-10 h-10 rounded-full bg-askku-primary flex items-center justify-center flex-shrink-0">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                                                    <path
                                                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                                                        fill="currentColor"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="bg-gray-100 px-4 py-3 rounded-lg">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>

            {/* Bookmark Sidebar */}
            <BookmarkSidebar
                bookmarks={bookmarks}
                onRemove={handleRemoveBookmark}
                onClearAll={handleClearAllBookmarks}
            />
        </div>
    )
}
