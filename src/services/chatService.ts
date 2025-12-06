import api from '../api/axiosInstance'
import DOMPurify from "dompurify"
import { ChatMessage, ChatSession, Bookmark, ExtractedSchedule } from '../types'

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
// AI RESPONSE (BACKEND)
// ------------------------------

export const generateAIResponse = async (
    userMessage: string
): Promise<{ text: string; format: 'markdown' | 'sources' | 'text' }> => {

    try {
        let session = getCurrentSession()
        if (!session) session = createNewSession()

        const recentHistory = session.messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
        }))

        const res = await api.post('/api/rag/ask', {
            message: userMessage,
            history: recentHistory,
            isFirstQuestion: session.messages.length === 0
        })

        const data = res.data

        if (data.type === 'answer') {
            return {
                text: cleanMarkdown(data.reply),
                format: "markdown"
            }
        }

        if (data.type === 'info_request') {
            return {
                text: cleanMarkdown(`### 🔍 추가 정보가 필요해요!\n${data.suggestion}`),
                format: "markdown"
            }
        }

        if (data.sources) {
            const md = data.sources.map((s: any, i: number) =>
                `**${i + 1}.** [${s.title}](${s.url})`).join("\n")

            return { text: cleanMarkdown(md), format: "sources" }
        }

        return { text: "알 수 없는 응답입니다.", format: "text" }

    } catch (e) {
        return {
            text: cleanMarkdown("❌ AI 서버 오류. 잠시 후 다시 시도해주세요."),
            format: "markdown"
        }
    }
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
            // sources는 현재 없음
        })

        if (!res.data.success) return null

        const newBookmark: Bookmark = {
            id: res.data.bookmark.id,
            question: res.data.bookmark.question,
            answer: res.data.bookmark.answer,
            summary: res.data.bookmark.summary,
            timestamp: new Date().toISOString()
        }

        // 기존 localStorage 유지(원하면 제거 가능)
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
