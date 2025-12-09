import api from '../api/axiosInstance';
import { RegisterData, AuthResponse, User } from '../types';

export const register = async (data: RegisterData): Promise<AuthResponse> => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
        return {
            success: false,
            message: '올바른 이메일 형식이 아닙니다'
        }
    }

    try {
        const res = await api.post('/api/users/register', {
            email: data.email,
            password: data.password,
            name: `${data.lastName}${data.firstName}`,
            department: data.department,
            grade: data.currentGrade,
            additional_info: null
        });

        return {
            success: true,
            message: '회원가입이 완료되었습니다. 로그인해주세요.'
        };

    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || '회원가입 실패'
        };
    }
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const res = await api.post('/api/users/login', {
            identifier: email,
            password
        });

        const token = res.data.token;

        // 기존 구조: saveToken(token) → localStorage 사용
        localStorage.setItem('token', token);
        localStorage.setItem('lastLogin', new Date().toISOString());

        // 프론트 기존 login() 반환값을 그대로 유지
        return {
            success: true,
            token,
            message: '로그인 성공',
            // user는 별도로 호출하지 않으면 null → 기존 코드 동일 유지
            user: undefined
        };

    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || '로그인 실패'
        };
    }
};

export const logout = (): void => {
    localStorage.removeItem('token');
};

export const getCurrentUser = async (): Promise<User | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const res = await api.get('/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        return res.data.user as User;

    } catch {
        return null;
    }
};

export const isAuthenticated = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        await api.get('/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;

    } catch {
        return false;
    }
};
