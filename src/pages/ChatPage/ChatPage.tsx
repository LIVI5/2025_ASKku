import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
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
import { addSchedule } from '../../services/myPageService'
import { ChatMessage as ChatMessageType } from '../../types'
import logoImage from '../../assets/logo_nonbg.svg'

export default function ChatPage() {
    const location = useLocation()
    const [messages, setMessages] = useState<ChatMessageType[]>([])
    const [bookmarks, setBookmarks] = useState(getBookmarks())
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const initialMessageSentRef = useRef(false)

    // Load session on mount and handle initial message from HomePage
    useEffect(() => {
        // Prevent multiple executions
        if (initialMessageSentRef.current) return

        let session = getCurrentSession()
        if (!session) {
            session = createNewSession()
        }

        // Handle initial message from HomePage
        const initialMessage = (location.state as any)?.initialMessage
        if (initialMessage) {
            initialMessageSentRef.current = true

            // If there are existing messages, start a new chat
            if (session.messages.length > 0) {
                clearSession()
                session = createNewSession()
            }

            // Set empty messages first
            setMessages([])

            // Send the initial message after a brief delay
            setTimeout(() => {
                handleSendMessage(initialMessage)
            }, 100)

            // Clear state to prevent resending on back navigation
            window.history.replaceState({}, document.title)
        } else {
            // Load existing session messages
            setMessages(session.messages)
        }
    }, [location.state])

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

    const handleTranslate = async (content: string) => {
        setIsLoading(true)
        try {
            const translationRequest = `Translate the following text to English:\n\n${content}`
            const aiResponse = await generateAIResponse(translationRequest)
            const aiMessage = addMessage(aiResponse, 'assistant')
            setMessages(prev => [...prev, aiMessage])
        } catch (error) {
            console.error('Error generating AI translation response:', error)
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

    const handleScheduleAdd = (messageId: string, content: string) => {
        // Extract date from content
        const extractDate = (text: string): string | null => {
            const currentYear = new Date().getFullYear()

            const format1 = /(\d{4})-(\d{1,2})-(\d{1,2})/
            const format2 = /(\d{1,2})월\s?(\d{1,2})일/
            const format3 = /(\d{4})년\s?(\d{1,2})월\s?(\d{1,2})일/

            let match = text.match(format1)
            if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`

            match = text.match(format3)
            if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`

            match = text.match(format2)
            if (match) return `${currentYear}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`

            return null
        }

        const dateString = extractDate(content)
        if (!dateString) {
            alert('날짜 정보를 찾을 수 없습니다.')
            return
        }

        // Find the user message before this assistant message
        const messageIndex = messages.findIndex(m => m.id === messageId)
        const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null
        const title = userMessage?.content || '챗봇 일정'

        addSchedule({
            title: title.substring(0, 50), // Limit title length
            date: dateString,
            type: 'academic',
            color: '#3B82F6'
        })

        alert(`일정이 등록되었습니다.\n날짜: ${dateString}\n내용: ${title}`)
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
        initialMessageSentRef.current = false
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
                                        onScheduleAdd={handleScheduleAdd}
                                        onTranslate={handleTranslate}
                                    />
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start mb-4">
                                        <div className="flex gap-3 max-w-[70%]">
                                            <div className="w-10 h-10 rounded-full bg-askku-primary flex items-center justify-center flex-shrink-0">
                                                <img src={logoImage} alt="ASKku Bot" className="w-6 h-6 object-contain" />
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
