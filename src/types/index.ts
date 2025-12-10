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
    introduction?: string
}

export interface RegisterData {
    lastName: string
    firstName: string
    email: string
    admissionYear: string
    currentGrade: number
    currentSemester: number
    department: string
    campus: string
    password: string
}

export interface AuthResponse {
    success: boolean
    token?: string
    user?: User
    message?: string
}

export type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isBookmarked: boolean;
    format: 'text' | 'markdown' | 'sources';
    isLoading?: boolean; // 스트리밍 로딩 중 표시
};

export interface Bookmark {
    id: string
    bookmarkID?: number
    title: string
    question: string
    answer: string
    sources?: any[]
    timestamp: string
}


export type ChatSession = {
    id: string;
    messages: ChatMessage[];
    createdAt: string;
};

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
    subject?: string
}

export type ExtractedSchedule = {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    description?: string;
    type?: string;
    location?: string;
};

export interface Subject {
    id: string
    name: string
    professor: string
}

export interface Timetable {
    subjects: Subject[]
}

export interface TimetableItem {
    id: string
    subject: string
    room: string
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'
    startTime: string // HH:mm
    endTime: string // HH:mm
    color?: string
    alias?: string
}
