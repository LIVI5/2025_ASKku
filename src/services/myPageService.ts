import { Schedule, TimetableItem } from '../types'

const SCHEDULES_KEY = 'askku_schedules'
const TIMETABLES_KEY = 'askku_timetables'

// Dummy Data Generation
const generateDummySchedules = (): Schedule[] => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')

    return [
        {
            id: 'sch_1',
            title: '데이터베이스 과제 마감',
            date: `${year}-${month}-15`,
            type: 'academic',
            color: '#EF4444' // Red
        },
        {
            id: 'sch_2',
            title: '동아리 회의',
            date: `${year}-${month}-20`,
            type: 'personal',
            color: '#3B82F6' // Blue
        },
        {
            id: 'sch_3',
            title: '중간고사 시작',
            date: `${year}-${month}-25`,
            type: 'academic',
            color: '#F59E0B' // Amber
        }
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
            semester: '2025-2',
            color: '#DBEAFE' // Blue-100
        },
        {
            id: 'tt_2',
            subject: '운영체제',
            room: 'IT관 401',
            day: 'Tue',
            startTime: '10:30',
            endTime: '12:00',
            semester: '2025-2',
            color: '#F3E8FF' // Purple-100
        },
        {
            id: 'tt_3',
            subject: '웹프로그래밍',
            room: 'IT관 205',
            day: 'Wed',
            startTime: '09:00',
            endTime: '10:30',
            semester: '2025-2',
            color: '#DCFCE7' // Green-100
        },
        {
            id: 'tt_4',
            subject: '알고리즘',
            room: '공학관 201',
            day: 'Thu',
            startTime: '10:30',
            endTime: '12:00',
            semester: '2025-2',
            color: '#FEF3C7' // Amber-100
        },
        {
            id: 'tt_5',
            subject: '컴퓨터구조',
            room: 'IT관 101',
            day: 'Mon',
            startTime: '14:00',
            endTime: '15:30',
            semester: '2025-2',
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
    return JSON.parse(json)
}

export const saveSchedules = (schedules: Schedule[]): void => {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules))
}

export const addSchedule = (schedule: Omit<Schedule, 'id'>): Schedule => {
    const schedules = getSchedules()
    const newSchedule: Schedule = {
        ...schedule,
        id: `sch_${Date.now()}`
    }
    schedules.push(newSchedule)
    saveSchedules(schedules)
    return newSchedule
}

export const deleteSchedule = (id: string): void => {
    const schedules = getSchedules().filter(s => s.id !== id)
    saveSchedules(schedules)
}

// Timetable Management
export const getTimetables = (semester: string): TimetableItem[] => {
    const json = localStorage.getItem(TIMETABLES_KEY)
    let items: TimetableItem[] = []

    if (!json) {
        items = generateDummyTimetables()
        saveAllTimetables(items)
    } else {
        items = JSON.parse(json)
    }

    return items.filter(item => item.semester === semester)
}

const saveAllTimetables = (items: TimetableItem[]): void => {
    localStorage.setItem(TIMETABLES_KEY, JSON.stringify(items))
}

export const addTimetableItem = (item: Omit<TimetableItem, 'id'>): TimetableItem => {
    const json = localStorage.getItem(TIMETABLES_KEY)
    const allItems: TimetableItem[] = json ? JSON.parse(json) : []

    const newItem: TimetableItem = {
        ...item,
        id: `tt_${Date.now()}`
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
