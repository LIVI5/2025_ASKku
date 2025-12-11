import api from '../api/axiosInstance';
import { Notice } from '../types';

export const getLatestNotices = async (): Promise<Notice[]> => {
    try {
        const res = await api.get('/api/notices/latest');
        
        // The API might be returning an object like { notices: [] }
        const rawNotices = Array.isArray(res.data) ? res.data : res.data.notices || [];

        if (!Array.isArray(rawNotices)) {
            console.error('Fetched data is not an array:', rawNotices);
            return [];
        }

        return rawNotices.map((notice: any) => ({
            id: notice.post_num || Date.now() + Math.random(), // Ensure unique ID
            source: notice.board_name,
            title: notice.title,
            date: notice.date,
            url: notice.link,
            content: notice.content || '', // Default value
            views: notice.views || 0,     // Default value
        }));
    } catch (error) {
        console.error('Error fetching latest notices:', error);
        return [];
    }
};
