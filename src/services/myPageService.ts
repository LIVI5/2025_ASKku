import api from '../api/axiosInstance';
import { Schedule, Timetable, TimetableItem } from '../types';

const SCHEDULES_KEY = 'askku_schedules';

const getDefaultColor = (type: Schedule['type']) => {
    if (type === 'academic') return '#3B82F6';
    if (type === 'personal') return '#10B981';
    if (type === 'subject') return '#8B5CF6';
    if (type === 'event') return '#F97316';
    return '#F59E0B';
};

const normalizeSchedule = (raw: Schedule | (Omit<Schedule, 'id'> & { id?: string })): Schedule => {
    const startDate = raw.startDate || raw.date;
    const endDate = raw.endDate || startDate;
    const type: Schedule['type'] =
        raw.type === 'academic' || raw.type === 'personal' || raw.type === 'subject' || raw.type === 'event'
            ? raw.type
            : 'other';

    return {
        ...raw,
        id: raw.id ?? `sch_${Date.now()}`,
        date: raw.date || startDate || endDate || new Date().toISOString().slice(0, 10),
        startDate: startDate || raw.date,
        endDate: endDate || startDate || raw.date,
        type,
        allDay: raw.allDay ?? true,
        color: raw.color || getDefaultColor(type)
    };
};

// Dummy Data Generation for Schedules (remains for now)
const generateDummySchedules = (): Schedule[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

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
    ];
};

// Schedule Management (using localStorage for now)
export const getSchedules = (): Schedule[] => {
    const json = localStorage.getItem(SCHEDULES_KEY);
    if (!json) {
        const dummy = generateDummySchedules();
        saveSchedules(dummy);
        return dummy;
    }
    try {
        const parsed: Schedule[] = JSON.parse(json);
        return parsed.map(normalizeSchedule);
    } catch {
        const dummy = generateDummySchedules();
        saveSchedules(dummy);
        return dummy;
    }
};

export const saveSchedules = (schedules: Schedule[]): void => {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
};

let scheduleIdCounter = 0;

export const addSchedule = (schedule: Omit<Schedule, 'id'>): Schedule => {
    const schedules = getSchedules();
    const newSchedule = normalizeSchedule({
        ...schedule,
        id: `sch_${Date.now()}_${scheduleIdCounter++}`
    });
    schedules.push(newSchedule);
    saveSchedules(schedules);
    return newSchedule;
};

export const deleteSchedule = (id: string): void => {
    const schedules = getSchedules().filter(s => s.id !== id);
    saveSchedules(schedules);
};

// --- NEW Timetable Management (API-based) ---

/**
 * Fetches the user's primary timetable from the server.
 * @returns A Promise that resolves to the user's Timetable object.
 */
export const getTimetable = async (): Promise<Timetable> => {
    try {
        const response = await api.get<{ timetable: Timetable }>('/api/timetable/primary');
        // The backend sends { timetable: { ... } }, so we extract it.
        return response.data.timetable;
    } catch (error) {
        console.error('Failed to fetch timetable:', error);
        // On failure, return an empty timetable structure to prevent UI crashes.
        // The backend guarantees one exists, so this is a fallback for network/auth errors.
        return { timetableID: 0, userID: 0, createdAt: '', items: [] };
    }
};

/**
 * Adds a new course (TimetableItem) to the user's primary timetable.
 * @param item - The course data, without the 'itemID' and 'timetableID'.
 * @returns A Promise that resolves to the newly created TimetableItem (including its new id).
 */
export const addTimetableItem = async (item: Omit<TimetableItem, 'itemID' | 'timetableID'>): Promise<TimetableItem> => {
    const response = await api.post<TimetableItem>('/api/timetable/primary/items', item);
    return response.data;
};

/**
 * Updates an existing course (TimetableItem).
 * @param itemId - The ID of the course to update.
 * @param item - An object containing the fields to update.
 * @returns A Promise that resolves to the updated TimetableItem.
 */
export const updateTimetableItem = async (itemId: number, item: Partial<Omit<TimetableItem, 'itemID' | 'timetableID'>>): Promise<TimetableItem> => {
    const response = await api.put<TimetableItem>(`/api/timetable/items/${itemId}`, item);
    return response.data;
};

/**
 * Deletes a course (TimetableItem) from the user's timetable.
 * @param itemId - The ID of the course to delete.
 */
export const deleteTimetableItem = async (itemId: number): Promise<void> => {
    await api.delete(`/api/timetable/items/${itemId}`);
};


// User Information Management
export const saveUserInformation = async (information: string): Promise<boolean> => {
    console.log('Attempting to save user additional information...');
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('saveUserInformation: No authentication token found.');
            return false;
        }
        console.log('saveUserInformation: Token found:', token);

        const payload = { additionalInfo: information };
        console.log('saveUserInformation: Payload:', payload);

        await api.put('/api/users/additional-info',
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('saveUserInformation: Additional information saved successfully.');
        return true;
    } catch (error: any) {
        console.error('saveUserInformation: Failed to save user additional information:', error);
        if (error.response) {
            console.error('saveUserInformation: Error data:', JSON.stringify(error.response.data));
            console.error('saveUserInformation: Error status:', error.response.status);
            console.error('saveUserInformation: Error headers:', error.response.headers);
        } else if (error.request) {
            console.error('saveUserInformation: No response received:', error.request);
        } else {
            console.error('saveUserInformation: Error message:', error.message);
        }
        return false;
    }
}

export const getUserInformation = (): string | null => {
    return null;
}