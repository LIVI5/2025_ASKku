export interface Notice {
    id: number
    source: string
    title: string
    content: string
    date: string
    views: number
    url?: string
}

export interface User {
    id: string
    name: string
    email: string
    admissionYear: string
    currentGrade: number
    currentSemester: number
    department: string
    createdAt: string
}

export interface RegisterData {
    lastName: string
    firstName: string
    email: string
    admissionYear: string
    currentGrade: number
    currentSemester: number
    department: string
    password: string
}

export interface AuthResponse {
    success: boolean
    token?: string
    user?: User
    message?: string
}

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    isBookmarked?: boolean
}

export interface Bookmark {
    id: string
    question: string
    answer: string
    timestamp: string
}

export interface ChatSession {
    id: string
    messages: ChatMessage[]
    createdAt: string
}

export interface Schedule {
    id: string
    title: string
    date: string // YYYY-MM-DD (legacy single-day)
    startDate?: string // YYYY-MM-DD
    endDate?: string // YYYY-MM-DD
    startTime?: string // HH:mm
    endTime?: string // HH:mm
    allDay?: boolean
    location?: string
    sourceId?: string // extracted schedule id from chat
    type: 'personal' | 'academic' | 'subject' | 'event' | 'other'
    description?: string
    color?: string
    semester?: string
    subject?: string
}

export interface ExtractedSchedule {
    id: string
    title: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
    allDay?: boolean
    description?: string
    type?: string
    location?: string
}

export interface Subject {
    id: string
    name: string
    professor: string
}

export interface Timetable {
    semester: string
    subjects: Subject[]
}

export interface TimetableItem {
    id: string
    subject: string
    room: string
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'
    startTime: string // HH:mm
    endTime: string // HH:mm
    semester: string // e.g., "2025-1"
    color?: string
}
