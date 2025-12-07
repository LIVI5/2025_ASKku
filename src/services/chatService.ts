import DOMPurify from "dompurify"
import { ChatMessage, ChatSession, Bookmark, ExtractedSchedule } from '../types'
import api from '../api/axiosInstance'

const CHAT_SESSION_KEY = 'askku_chat_session'
const BOOKMARKS_KEY = 'askku_bookmarks'

// ------------------------------
// CHAT SESSION MANAGEMENT
// ------------------------------

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
    const json = localStorage.getItem(CHAT_SESSION_KEY)
    return json ? JSON.parse(json) : null
}

export const saveSession = (session: ChatSession): void => {
    localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session))
}

export const clearSession = (): void => {
    localStorage.removeItem(CHAT_SESSION_KEY)
}

// ------------------------------
// MESSAGE MANAGEMENT
// ------------------------------

export const addMessage = (
    content: string,
    role: 'user' | 'assistant',
    format: 'text' | 'markdown' | 'sources' = 'text'
): ChatMessage => {

    let session = getCurrentSession()
    if (!session) session = createNewSession()

    const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        role,
        content,
        timestamp: new Date().toISOString(),
        isBookmarked: false,
        format
    }

    session.messages.push(message)
    saveSession(session)

    return message
}

// 메시지 업데이트 (스트리밍용)
export const updateMessage = (messageId: string, content: string): void => {
    const session = getCurrentSession()
    if (!session) return

    const message = session.messages.find(m => m.id === messageId)
    if (message) {
        message.content = content
        saveSession(session)
    }
}

// ------------------------------
// CLEAN MARKDOWN
// ------------------------------

const cleanMarkdown = (text: string): string => {
    if (!text) return "";
    return DOMPurify.sanitize(text.replace(/\r\n/g, "\n").trim(), {
        USE_PROFILES: { html: true }
    });
};

// ------------------------------
// AI RESPONSE (STREAMING)
// ------------------------------

export const generateAIResponseStream = async (
    userMessage: string,
    onChunk: (chunk: string) => void,
    onSources?: (sources: any[]) => void,
    onComplete?: () => void,
    onError?: (error: string) => void
): Promise<void> => {

    try {
        let session = getCurrentSession()
        if (!session) session = createNewSession()

        const recentHistory = session.messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
        }))

        // RAG API는 8001 포트
        const baseURL = 'http://localhost:8001'
        const url = `${baseURL}/chat`
        
        console.log('[DEBUG] Fetching:', url)
        console.log('[DEBUG] Payload:', { message: userMessage, history: recentHistory })
        
        // Fetch API로 스트리밍 요청
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                history: recentHistory,
                user_info: {
                    name: '사용자',
                    department: '미제공',
                    grade: '미제공'
                },
                timetable: []
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[DEBUG] Response not OK:', response.status, errorText)
            throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
            throw new Error('No reader available')
        }

        let buffer = ''

        while (true) {
            const { done, value } = await reader.read()
            
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            
            // SSE 형식 파싱: "data: {...}\n\n"
            const lines = buffer.split('\n\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
                if (!line.trim() || !line.startsWith('data: ')) continue

                try {
                    const jsonStr = line.replace('data: ', '').trim()
                    const event = JSON.parse(jsonStr)

                    if (event.type === 'sources') {
                        if (onSources) onSources(event.sources)
                    } 
                    else if (event.type === 'content') {
                        onChunk(event.content)
                    }
                    else if (event.type === 'done') {
                        if (onComplete) onComplete()
                    }
                    else if (event.type === 'error') {
                        throw new Error(event.message)
                    }
                } catch (e) {
                    console.error('Parse error:', e, line)
                }
            }
        }

    } catch (e) {
        console.error('[DEBUG] AI Response Stream Error:', e)
        if (onError) {
            onError('답변 생성 중 오류가 발생했습니다.')
        }
    }
}

// 기존 non-streaming 버전 (호환성 유지)
export const generateAIResponse = async (
    userMessage: string
): Promise<{ text: string; format: 'markdown' | 'sources' | 'text' }> => {

    return new Promise((resolve, reject) => {
        let fullText = ''

        generateAIResponseStream(
            userMessage,
            (chunk) => {
                fullText += chunk
            },
            undefined,
            () => {
                resolve({
                    text: cleanMarkdown(fullText),
                    format: 'markdown'
                })
            },
            (error) => {
                reject(new Error(error))
            }
        )
    })
}

// ------------------------------
// BOOKMARKS (LOCAL)
// ------------------------------

export const getBookmarks = (): Bookmark[] => {
    const json = localStorage.getItem(BOOKMARKS_KEY)
    return json ? JSON.parse(json) : []
}

export const addBookmark = async (
    messageId: string,
    question: string,
    answer: string
): Promise<Bookmark | null> => {
    try {
        const res = await api.post('/api/bookmarks', {
            question,
            answer,
        })

        if (!res.data.success) return null

        const newBookmark: Bookmark = {
            id: res.data.bookmark.id,
            question: res.data.bookmark.question,
            answer: res.data.bookmark.answer,
            summary: res.data.bookmark.summary,
            timestamp: new Date().toISOString()
        }

        const bookmarks = getBookmarks()
        bookmarks.unshift(newBookmark)
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))

        return newBookmark
    } catch (err) {
        console.error('Bookmark API Error:', err)
        return null
    }
}

export const removeBookmark = (messageId: string): void => {
    const bookmarks = getBookmarks().filter(b => b.id !== messageId)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))

    const session = getCurrentSession()
    if (session) {
        const msg = session.messages.find(m => m.id === messageId)
        if (msg) {
            msg.isBookmarked = false
            saveSession(session)
        }
    }
}

export const toggleMessageBookmark = (messageId: string): void => {
    const session = getCurrentSession()
    if (!session) return

    const msg = session.messages.find(m => m.id === messageId)
    if (!msg || msg.role !== "assistant") return

    msg.isBookmarked = !msg.isBookmarked
    saveSession(session)

    const idx = session.messages.findIndex(m => m.id === messageId)
    const userMsg = session.messages[idx - 1]

    if (msg.isBookmarked && userMsg) {
        addBookmark(messageId, userMsg.content, msg.content)
    } else {
        removeBookmark(messageId)
    }
}

// ------------------------------
// SCHEDULE EXTRACTION
// ------------------------------

export const extractSchedulesFromConversation = async (
    question: string,
    answer: string
): Promise<ExtractedSchedule[]> => {

    try {
        const res = await api.post("/api/schedule/extract", { question, answer })

        if (!res.data.success) return []
        return res.data.schedules

    } catch (e) {
        console.error("Schedule Extract Error:", e)
        return []
    }
}

export const clearAllBookmarks = (): void => {
    const session = getCurrentSession()
    if (session) {
        session.messages.forEach(m => {
            if (m.isBookmarked) m.isBookmarked = false
        })
        saveSession(session)
    }
    localStorage.removeItem(BOOKMARKS_KEY)
}