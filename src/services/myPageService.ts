import api from '../api/axiosInstance';
import { Schedule, Timetable, TimetableItem, Calendar } from '../types';

// --- Schedule Management (API-based) ---

/**
 * Fetches the user's primary calendar and its schedules from the server.
 * @returns A Promise that resolves to an array of Schedule objects.
 */
export const getPrimaryCalendarSchedules = async (): Promise<Schedule[]> => {
    try {
        const response = await api.get<{ calendar: Calendar }>('/api/schedule/primary');
        // The backend returns { calendar: { ... } }. We need to access its Schedules.
        // Based on the backend description: "calendar.Schedules (대문자 'S')"
        return response.data.calendar.Schedules || [];
    } catch (error) {
        console.error('Failed to fetch primary calendar schedules:', error);
        return [];
    }
};

/**
 * Adds a new schedule item to the user's primary calendar.
 * @param schedule - The schedule data, without the 'itemID'.
 * @returns A Promise that resolves to the newly created Schedule item (including its new id).
 */
export const addPrimaryScheduleItem = async (schedule: Omit<Schedule, 'itemID'>): Promise<Schedule> => {
    const payload = {
        title: schedule.title,
        description: schedule.description,
        // Backend expects startDate, endDate, startTime, endTime, isAllDay, type, location etc.
        // Assuming `date` from frontend maps to both `startDate` and `endDate` if not explicitly provided.
        startDate: schedule.startDate || schedule.date,
        endDate: schedule.endDate || schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isAllDay: schedule.allDay ?? false, // Default to false if not provided
        type: schedule.type,
        location: schedule.location,
        color: schedule.color,
        subject: schedule.subject // 'subject' is specific to frontend logic for 'subject' type, might need backend mapping or removal if not directly stored.
    };

    const response = await api.post<Schedule>('/api/schedule/primary/items', payload);
    return response.data;
};

/**
 * Updates an existing schedule item.
 * @param itemId - The ID of the schedule item to update.
 * @param scheduleData - An object containing the fields to update.
 * @returns A Promise that resolves to the updated Schedule item.
 */
export const updateScheduleItem = async (itemId: string, scheduleData: Partial<Omit<Schedule, 'itemID'>>): Promise<Schedule> => {
    // Map partial Schedule object to backend payload
    const payload: any = {
        title: scheduleData.title,
        description: scheduleData.description,
        startDate: scheduleData.startDate || scheduleData.date,
        endDate: scheduleData.endDate || scheduleData.date,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        isAllDay: scheduleData.allDay,
        type: scheduleData.type,
        location: scheduleData.location,
        color: scheduleData.color,
        subject: scheduleData.subject
    };
    // Remove undefined values from payload
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const response = await api.put<Schedule>(`/api/schedule/items/${itemId}`, payload);
    return response.data;
};

/**
 * Deletes a schedule item from a calendar.
 * @param itemId - The ID of the schedule item to delete.
 */
export const deleteScheduleItem = async (itemId: string): Promise<void> => {
    await api.delete(`/api/schedule/items/${itemId}`);
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