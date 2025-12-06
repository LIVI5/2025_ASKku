import { Schedule, Timetable, TimetableItem } from '../types'
import { dummyTimetables } from '../data/dummyData'
import { getCurrentUser } from '../services/authService'

const SCHEDULES_KEY = 'askku_schedules'
const TIMETABLES_KEY = 'askku_timetables'

const getDefaultColor = (type: Schedule['type']) => {
    if (type === 'academic') return '#3B82F6'
    if (type === 'personal') return '#10B981'
    if (type === 'subject') return '#8B5CF6'
    if (type === 'event') return '#F97316'
    return '#F59E0B'
}

const normalizeSchedule = (raw: Schedule | (Omit<Schedule, 'id'> & { id?: string })): Schedule => {
    const startDate = raw.startDate || raw.date
    const endDate = raw.endDate || startDate
    const type: Schedule['type'] =
        raw.type === 'academic' || raw.type === 'personal' || raw.type === 'subject' || raw.type === 'event'
            ? raw.type
            : 'other'

    return {
        ...raw,
        id: raw.id ?? `sch_${Date.now()}`,
        date: raw.date || startDate || endDate || new Date().toISOString().slice(0, 10),
        startDate: startDate || raw.date,
        endDate: endDate || startDate || raw.date,
        type,
        allDay: raw.allDay ?? true,
        color: raw.color || getDefaultColor(type)
    }
}

// Dummy Data Generation
const generateDummySchedules = (): Schedule[] => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')

    return [
        normalizeSchedule({
            id: 'sch_1',
            title: '데이터베이스 과제 마감',
            date: `${year}-${month}-15`,
            description: `- ERD 설계
- 요구사항 명세서 작성`,
            type: 'academic',
            color: '#EF4444' // Red
        }),
        normalizeSchedule({
            id: 'sch_2',
            title: '동아리 회의',
            date: `${year}-${month}-20`,
            description: '중간 발표 준비',
            type: 'personal',
            color: '#3B82F6' // Blue
        }),
        normalizeSchedule({
            id: 'sch_3',
            title: '중간고사 시작',
            date: `${year}-${month}-25`,
            description: '',
            type: 'academic',
            color: '#F59E0B' // Amber
        })
    ]
}

const generateDummyTimetables = (): TimetableItem[] => {
    return [
        {
            id: 'tt_1',
            subject: '데이터베이스',
            room: '공학관 301',
            day: 'Mon',
            startTime: '09:00',
            endTime: '10:30',
            color: '#DBEAFE' // Blue-100
        },
        {
            id: 'tt_2',
            subject: '운영체제',
            room: 'IT관 401',
            day: 'Tue',
            startTime: '10:30',
            endTime: '12:00',
            color: '#F3E8FF' // Purple-100
        },
        {
            id: 'tt_3',
            subject: '웹프로그래밍',
            room: 'IT관 205',
            day: 'Wed',
            startTime: '09:00',
            endTime: '10:30',
            color: '#DCFCE7' // Green-100
        },
        {
            id: 'tt_4',
            subject: '알고리즘',
            room: '공학관 201',
            day: 'Thu',
            startTime: '10:30',
            endTime: '12:00',
            color: '#FEF3C7' // Amber-100
        },
        {
            id: 'tt_5',
            subject: '컴퓨터구조',
            room: 'IT관 101',
            day: 'Mon',
            startTime: '14:00',
            endTime: '15:30',
            color: '#FEE2E2' // Red-100
        }
    ]
}

// Schedule Management
export const getSchedules = (): Schedule[] => {
    const json = localStorage.getItem(SCHEDULES_KEY)
    if (!json) {
        const dummy = generateDummySchedules()
        saveSchedules(dummy)
        return dummy
    }
    try {
        const parsed: Schedule[] = JSON.parse(json)
        return parsed.map(normalizeSchedule)
    } catch {
        const dummy = generateDummySchedules()
        saveSchedules(dummy)
        return dummy
    }
}

export const saveSchedules = (schedules: Schedule[]): void => {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules))
}

export const addSchedule = (schedule: Omit<Schedule, 'id'>): Schedule => {
    const schedules = getSchedules()
    const newSchedule = normalizeSchedule({
        ...schedule,
        id: `sch_${Date.now()}`
    })
    schedules.push(newSchedule)
    saveSchedules(schedules)
    return newSchedule
}

export const deleteSchedule = (id: string): void => {
    const schedules = getSchedules().filter(s => s.id !== id)
    saveSchedules(schedules)
}

export const getTimetableData = (): Timetable[] => {
    return dummyTimetables
}

// Timetable Management
export const getTimetables = (): TimetableItem[] => {
    const json = localStorage.getItem(TIMETABLES_KEY)
    let items: TimetableItem[] = []

    if (!json) {
        items = generateDummyTimetables()
        saveAllTimetables(items)
    } else {
        items = JSON.parse(json)
    }

    return items
}

const saveAllTimetables = (items: TimetableItem[]): void => {
    localStorage.setItem(TIMETABLES_KEY, JSON.stringify(items))
}

export const addTimetableItem = (item: Omit<TimetableItem, 'id'>): TimetableItem => {
    const json = localStorage.getItem(TIMETABLES_KEY)
    const allItems: TimetableItem[] = json ? JSON.parse(json) : []

    const newItem: TimetableItem = {
        ...item,
        id: `tt_${Date.now()}`,
        alias: item.alias || ''
    }

    allItems.push(newItem)
    saveAllTimetables(allItems)
    return newItem
}

export const deleteTimetableItem = (id: string): void => {
    const json = localStorage.getItem(TIMETABLES_KEY)
    if (json) {
        const allItems: TimetableItem[] = JSON.parse(json)
        const filtered = allItems.filter(item => item.id !== id)
        saveAllTimetables(filtered)
    }
}

// User Information Management
const getUserInformationKey = (userId: string): string => `askku_user_info_${userId}`

export const saveUserInformation = (information: string): void => {
    const currentUser = getCurrentUser()
    if (currentUser) {
        localStorage.setItem(getUserInformationKey(currentUser.id), information)
    }
}

export const getUserInformation = (): string | null => {
    const currentUser = getCurrentUser()
    if (currentUser) {
        return localStorage.getItem(getUserInformationKey(currentUser.id))
    }
    return null
}
