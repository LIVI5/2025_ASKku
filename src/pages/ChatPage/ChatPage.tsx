import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ChatMessage from '../../components/Chat/ChatMessage'
import ChatInput from '../../components/Chat/ChatInput'
import BookmarkSidebar from '../../components/Chat/BookmarkSidebar'
import ScheduleSelectionModal from '../../components/Chat/ScheduleSelectionModal'
import {
    addMessage,
    clearAllBookmarks,
    clearSession,
    createNewSession,
    extractSchedulesFromConversation,
    generateAIResponse,
    getBookmarks,
    getCurrentSession,
    removeBookmark,
    toggleMessageBookmark
} from '../../services/chatService'
import { addSchedule } from '../../services/myPageService'
import { ChatMessage as ChatMessageType, ExtractedSchedule, Schedule } from '../../types'
import logoImage from '../../assets/logo_nonbg.svg'

const normalizeType = (type?: string): Schedule['type'] => {
    if (type === 'academic' || type === 'personal' || type === 'subject') return type
    if (type === 'event') return 'event'
    return 'other'
}

export default function ChatPage() {
    const location = useLocation()
    const [messages, setMessages] = useState<ChatMessageType[]>([])
    const [bookmarks, setBookmarks] = useState(getBookmarks())
    const [isLoading, setIsLoading] = useState(false)
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [isScheduleLoading, setIsScheduleLoading] = useState(false)
    const [scheduleCandidates, setScheduleCandidates] = useState<ExtractedSchedule[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const initialMessageSentRef = useRef(false)

    // 세션 로드 + 홈에서 넘어온 초기 메시지 처리
    useEffect(() => {
        if (initialMessageSentRef.current) return

        let session = getCurrentSession()
        if (!session) {
            session = createNewSession()
        }

        const initialMessage = (location.state as any)?.initialMessage
        if (initialMessage) {
            initialMessageSentRef.current = true

            if (session.messages.length > 0) {
                clearSession()
                session = createNewSession()
            }

            setMessages([])

            setTimeout(() => {
                handleSendMessage(initialMessage)
            }, 100)

            window.history.replaceState({}, document.title)
        } else {
            setMessages(session.messages)
        }
    }, [location.state])

    // 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async (content: string) => {
        const userMessage = addMessage(content, 'user')
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
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

    const handleScheduleExtract = async (messageId: string) => {
        const messageIndex = messages.findIndex(m => m.id === messageId)
        if (messageIndex <= 0) {
            alert('바로 앞의 질문과 답변이 필요합니다.')
            return
        }

        const question = messages[messageIndex - 1]?.content || ''
        const answer = messages[messageIndex]?.content || ''

        setIsScheduleModalOpen(true)
        setIsScheduleLoading(true)
        setScheduleCandidates([])

        try {
            const extracted = await extractSchedulesFromConversation(question, answer)
            setScheduleCandidates(extracted)
        } catch (error) {
            console.error('Error extracting schedules:', error)
            alert('일정 추출 중 오류가 발생했습니다.')
        } finally {
            setIsScheduleLoading(false)
        }
    }

    const handleScheduleConfirm = (selected: ExtractedSchedule[]) => {
        if (!selected.length) {
            setIsScheduleModalOpen(false)
            return
        }

        selected.forEach(item => {
            const type = normalizeType(item.type)
            addSchedule({
                title: item.title || '새 일정',
                date: item.startDate,
                startDate: item.startDate,
                endDate: item.endDate || item.startDate,
                startTime: item.startTime,
                endTime: item.endTime,
                allDay: item.allDay ?? false,
                description: item.description,
                type,
                location: item.location,
                subject: type === 'subject' ? item.title : undefined,
                color: undefined,
                sourceId: item.id
            })
        })

        setIsScheduleModalOpen(false)
        setScheduleCandidates([])
        alert(`${selected.length}개의 일정이 캘린더에 추가되었습니다.`)
    }

    const handleRemoveBookmark = (bookmarkId: string) => {
        removeBookmark(bookmarkId)
        setBookmarks(getBookmarks())
        const session = getCurrentSession()
        if (session) {
            setMessages([...session.messages])
        }
    }

    const handleClearAllBookmarks = () => {
        if (window.confirm('모든 북마크를 삭제하시겠어요?')) {
            clearAllBookmarks()
            setBookmarks([])
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
        setIsScheduleModalOpen(false)
        setScheduleCandidates([])
        setIsScheduleLoading(false)
        initialMessageSentRef.current = false
    }

    const closeScheduleModal = () => {
        setIsScheduleModalOpen(false)
        setScheduleCandidates([])
        setIsScheduleLoading(false)
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
                                        onScheduleExtract={handleScheduleExtract}
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

            <ScheduleSelectionModal
                isOpen={isScheduleModalOpen}
                isLoading={isScheduleLoading}
                schedules={scheduleCandidates}
                onClose={closeScheduleModal}
                onConfirm={handleScheduleConfirm}
            />
        </div>
    )
}
