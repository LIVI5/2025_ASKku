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
    generateAIResponseStream,
    getBookmarks,
    getCurrentSession,
    removeBookmark,
    toggleMessageBookmark,
    updateMessage
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

    // ---------------------------
    // 세션 로드 + 초기 질문 처리
    // ---------------------------
    useEffect(() => {
        if (initialMessageSentRef.current) return

        let session = getCurrentSession()
        if (!session) session = createNewSession()

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

    // ---------------------------
    // 자동 스크롤
    // ---------------------------
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // ---------------------------
    // 메시지 전송 (스트리밍)
    // ---------------------------
    const handleSendMessage = async (content: string) => {
        // 1. 사용자 메시지 추가
        const userMessage = addMessage(content, 'user', 'text')
        setMessages(prev => [...prev, userMessage])

        // 2. 빈 AI 메시지 생성
        const aiMessage = addMessage('', 'assistant', 'markdown')
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(true)

        let accumulatedText = ''

        try {
            await generateAIResponseStream(
                content,
                // onChunk: 실시간으로 텍스트 누적
                (chunk) => {
                    accumulatedText += chunk
                    updateMessage(aiMessage.id, accumulatedText)
                    
                    // UI 업데이트
                    setMessages(prev => 
                        prev.map(m => 
                            m.id === aiMessage.id 
                                ? { ...m, content: accumulatedText }
                                : m
                        )
                    )
                },
                // onSources: 출처 정보 (필요시 활용)
                (sources) => {
                    console.log('Sources:', sources)
                },
                // onComplete: 완료 시
                () => {
                    console.log('Streaming completed')
                    setIsLoading(false)
                },
                // onError: 에러 시
                (error) => {
                    console.error('Stream error:', error)
                    updateMessage(aiMessage.id, '❌ 답변 생성 중 오류가 발생했습니다.')
                    setMessages(prev => 
                        prev.map(m => 
                            m.id === aiMessage.id 
                                ? { ...m, content: '❌ 답변 생성 중 오류가 발생했습니다.' }
                                : m
                        )
                    )
                    setIsLoading(false)
                }
            )
        } catch (error) {
            console.error('Error in handleSendMessage:', error)
            setIsLoading(false)
        }
    }

    // ---------------------------
    // 번역 요청 (스트리밍)
    // ---------------------------
    const handleTranslate = async (content: string) => {
        const request = `Translate the following text to English:\n\n${content}`
        
        const userMessage = addMessage(request, 'user', 'text')
        setMessages(prev => [...prev, userMessage])

        const aiMessage = addMessage('', 'assistant', 'markdown')
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(true)

        let accumulatedText = ''

        try {
            await generateAIResponseStream(
                request,
                (chunk) => {
                    accumulatedText += chunk
                    updateMessage(aiMessage.id, accumulatedText)
                    
                    setMessages(prev => 
                        prev.map(m => 
                            m.id === aiMessage.id 
                                ? { ...m, content: accumulatedText }
                                : m
                        )
                    )
                },
                undefined,
                () => {
                    setIsLoading(false)
                },
                (error) => {
                    console.error('Translation error:', error)
                    setIsLoading(false)
                }
            )
        } catch (error) {
            console.error('Error generating translation:', error)
            setIsLoading(false)
        }
    }

    // ---------------------------
    // 북마크 토글
    // ---------------------------
    const handleBookmark = (messageId: string) => {
        toggleMessageBookmark(messageId)
        const session = getCurrentSession()
        if (session) setMessages([...session.messages])
        setBookmarks(getBookmarks())
    }

    // ---------------------------
    // 일정 추출
    // ---------------------------
    const handleScheduleExtract = async (messageId: string) => {
        const messageIndex = messages.findIndex(m => m.id === messageId)
        if (messageIndex <= 0) {
            alert('바로 앞의 질문과 답변이 필요합니다.')
            return
        }

        const question = messages[messageIndex - 1]?.content ?? ''
        const answer = messages[messageIndex]?.content ?? ''

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

    // ---------------------------
    // 일정 추가 확인
    // ---------------------------
    const handleScheduleConfirm = (selected: ExtractedSchedule[]) => {
        if (selected.length === 0) {
            setIsScheduleModalOpen(false)
            return
        }

        selected.forEach(item => {
            const type = normalizeType(item.type)
            addSchedule({
                title: item.title,
                date: item.startDate,
                startDate: item.startDate,
                endDate: item.endDate ?? item.startDate,
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

        alert(`${selected.length}개의 일정이 캘린더에 추가되었습니다.`)
        setIsScheduleModalOpen(false)
        setScheduleCandidates([])
    }

    // ---------------------------
    // 북마크 삭제
    // ---------------------------
    const handleRemoveBookmark = (id: string) => {
        removeBookmark(id)
        setBookmarks(getBookmarks())
        const session = getCurrentSession()
        if (session) setMessages([...session.messages])
    }

    // ---------------------------
    // 북마크 전체 삭제
    // ---------------------------
    const handleClearAllBookmarks = () => {
        if (!window.confirm('모든 북마크를 삭제하시겠어요?')) return
        clearAllBookmarks()
        setBookmarks([])
        const session = getCurrentSession()
        if (session) setMessages([...session.messages])
    }

    // ---------------------------
    // New Chat
    // ---------------------------
    const handleNewChat = () => {
        clearSession()
        const session = createNewSession()
        setMessages(session.messages)
        setIsLoading(false)
        setScheduleCandidates([])
        setIsScheduleModalOpen(false)
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
            {/* 메인 채팅 영역 */}
            <div className="flex-1 flex flex-col bg-gray-50">

                {/* Header */}
                <div className="bg-white border-b border-gray-200 h-[72px] px-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">채팅</h1>
                    <button
                        onClick={handleNewChat}
                        className="px-4 py-2 bg-askku-primary text-white rounded-lg font-medium hover:bg-askku-secondary transition-colors flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        New Chat
                    </button>
                </div>

                {/* 메시지 영역 */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 rounded-full bg-askku-primary flex items-center justify-center mb-4">
                                <img src={logoImage} alt="ASKku Logo" className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">무엇을 도와드릴까요?</h2>
                            <p className="text-gray-500">학과와 관련된 정보 아무거나 물어보세요!</p>
                        </div>
                    ) : (
                        <>
                            <div className="max-w-4xl mx-auto">
                                <p className="text-center text-sm text-gray-500 mb-6">
                                    Chat with Assistant
                                </p>

                                {messages.map((msg) => (
                                    <ChatMessage
                                        key={msg.id}
                                        message={msg}
                                        onBookmark={handleBookmark}
                                        onTranslate={handleTranslate}
                                        onScheduleExtract={handleScheduleExtract}
                                    />
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start mb-4">
                                        <div className="flex gap-3 max-w-[70%]">
                                            <div className="w-10 h-10 rounded-full bg-askku-primary flex items-center justify-center">
                                                <img src={logoImage} alt="ASKku Bot" className="w-6 h-6" />
                                            </div>
                                            <div className="bg-gray-100 px-4 py-3 rounded-lg">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
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

                {/* 입력창 */}
                <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>

            {/* 북마크 사이드바 */}
            <BookmarkSidebar
                bookmarks={bookmarks}
                onRemove={handleRemoveBookmark}
                onClearAll={handleClearAllBookmarks}
            />

            {/* 일정 선택 모달 */}
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