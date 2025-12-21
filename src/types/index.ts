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
    userID: string
    email: string
    name: string
    password_hash: string
    campus: string
    admissionYear: number
    semester: number
    grade: number
    department: string
    createdAt: string
    introduction?: string
    additional_info?: string
}

export interface RegisterData {
    lastName: string
    firstName: string
    email: string
    admissionYear: number
    grade: number
    semester: number
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
    sources?: any[]; // RAG 출처 정보
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
    itemID: string // Changed from 'id' to 'itemID'
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
    courseName?: string; // New field for subject-type schedules
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
    color?: string; // Optional color for extracted schedules
};

export interface Timetable {
    timetableID: number;
    userID: number;
    createdAt: string;
    items: TimetableItem[];
}

export interface TimetableItem {
    itemID: number;
    timetableID: number;
    courseName: string;
    dayOfWeek: '월' | '화' | '수' | '목' | '금';
    startTime: string; // HH:mm:ss
    endTime: string; // HH:mm:ss
    location: string;
    alias?: string;
    color?: string;
}

export interface Calendar {
    calendarID: number;
    userID: number;
    title: string;
    schedules: Schedule[]; // Changed to lowercase to match backend alias
    createdAt: string;
    updatedAt: string;
}
