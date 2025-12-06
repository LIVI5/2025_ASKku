import { ChatMessage, ChatSession, Bookmark, ExtractedSchedule } from '../types'
import { generateDummyResponse } from '../data/dummyResponses'

const CHAT_SESSION_KEY = 'askku_chat_session'
const BOOKMARKS_KEY = 'askku_bookmarks'

// Chat Session Management
export const createNewSession = (): ChatSession => {
    const session: ChatSession = {
        id: `session_${Date.now()}`,
        messages: [],
        createdAt: new Date().toISOString()
    }
    saveSession(session)
    return session
}

export const getCurrentSession = (): ChatSession | null => {
    const sessionJson = localStorage.getItem(CHAT_SESSION_KEY)
    return sessionJson ? JSON.parse(sessionJson) : null
}

export const saveSession = (session: ChatSession): void => {
    localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session))
}

export const clearSession = (): void => {
    localStorage.removeItem(CHAT_SESSION_KEY)
}

// Message Management
export const addMessage = (content: string, role: 'user' | 'assistant'): ChatMessage => {
    let session = getCurrentSession()
    if (!session) {
        session = createNewSession()
    }

    const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        role,
        content,
        timestamp: new Date().toISOString(),
        isBookmarked: false
    }

    session.messages.push(message)
    saveSession(session)

    return message
}

// AI Response Generation
export const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate dummy response
    return generateDummyResponse(userMessage)
}

// Bookmark Management
export const addBookmark = (messageId: string, question: string, answer: string): string => {
    const bookmarks = getBookmarks()
    const bookmark: Bookmark = {
        id: messageId, // Use messageId as bookmark id for easy matching
        question,
        answer,
        timestamp: new Date().toISOString()
    }
    bookmarks.unshift(bookmark) // Add to beginning
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
    return bookmark.id
}

export const getBookmarks = (): Bookmark[] => {
    const bookmarksJson = localStorage.getItem(BOOKMARKS_KEY)
    return bookmarksJson ? JSON.parse(bookmarksJson) : []
}

export const removeBookmark = (messageId: string): void => {
    const bookmarks = getBookmarks().filter(b => b.id !== messageId)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))

    // Also update the message bookmark status
    const session = getCurrentSession()
    if (session) {
        const message = session.messages.find(m => m.id === messageId)
        if (message) {
            message.isBookmarked = false
            saveSession(session)
        }
    }
}

export const clearAllBookmarks = (): void => {
    // Clear all bookmark flags in messages
    const session = getCurrentSession()
    if (session) {
        session.messages.forEach(m => {
            if (m.isBookmarked) {
                m.isBookmarked = false
            }
        })
        saveSession(session)
    }

    localStorage.removeItem(BOOKMARKS_KEY)
}

export const toggleMessageBookmark = (messageId: string): void => {
    const session = getCurrentSession()
    if (!session) return

    const message = session.messages.find(m => m.id === messageId)
    if (!message || message.role !== 'assistant') return

    message.isBookmarked = !message.isBookmarked
    saveSession(session)

    // Find the user message before this assistant message
    const messageIndex = session.messages.findIndex(m => m.id === messageId)
    const userMessage = messageIndex > 0 ? session.messages[messageIndex - 1] : null

    if (message.isBookmarked && userMessage) {
        // Add bookmark
        addBookmark(messageId, userMessage.content, message.content)
    } else {
        // Remove bookmark
        removeBookmark(messageId)
    }
}

// Schedule extraction from QA pairs (placeholder for GPT backend)
export const extractSchedulesFromConversation = async (
    question: string,
    answer: string
): Promise<ExtractedSchedule[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    // TODO: Replace this dummy logic with real API integration
    const today = new Date()
    const formatDate = (date: Date) => date.toISOString().slice(0, 10)
    const addDays = (date: Date, days: number) => {
        const d = new Date(date)
        d.setDate(d.getDate() + days)
        return d
    }

    return [
        {
            id: `ext_${Date.now()}_1`,
            title: '답변 요약 일정 1',
            startDate: formatDate(addDays(today, 1)),
            endDate: formatDate(addDays(today, 1)),
            startTime: '09:00',
            endTime: '10:00',
            allDay: false,
            description: answer.slice(0, 120) || '답변에서 추출한 일정 설명',
            type: 'academic',
            location: '온라인'
        },
        {
            id: `ext_${Date.now()}_2`,
            title: '답변 요약 일정 2',
            startDate: formatDate(addDays(today, 3)),
            endDate: formatDate(addDays(today, 4)),
            allDay: true,
            description: question.slice(0, 120) || '질문/답변 기반 일정',
            type: 'event',
            location: '캠퍼스'
        }
    ]
}
