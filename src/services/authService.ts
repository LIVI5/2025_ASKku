import { RegisterData, AuthResponse, User } from '../types'
import { generateToken, decodeToken, verifyToken } from '../utils/jwtUtils'
import {
    saveUser,
    getUserByEmail,
    getUserById,
    savePassword,
    verifyPassword,
    saveToken,
    getToken,
    removeToken
} from './storageService'
import { setLastLoginTime } from '../utils/localStorage'

export const register = async (data: RegisterData): Promise<AuthResponse> => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
        return {
            success: false,
            message: '올바른 이메일 형식이 아닙니다'
        }
    }

    // Check if email already exists
    if (getUserByEmail(data.email)) {
        return {
            success: false,
            message: '이미 사용 중인 이메일입니다'
        }
    }

    // Create new user
    const user: User = {
        id: `user_${Date.now()}`,
        name: `${data.lastName}${data.firstName}`,
        email: data.email,
        admissionYear: data.admissionYear,
        currentGrade: data.currentGrade,
        currentSemester: data.currentSemester,
        department: data.department,
        createdAt: new Date().toISOString()
    }

    // Save user and password
    saveUser(user)
    savePassword(user.id, data.password)

    // Do NOT auto-login, just return success
    return {
        success: true,
        message: '회원가입이 완료되었습니다. 로그인해주세요.'
    }
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    // Find user by email only
    const user = getUserByEmail(email)

    if (!user) {
        return {
            success: false,
            message: '존재하지 않는 사용자입니다'
        }
    }

    // Verify password
    if (!verifyPassword(user.id, password)) {
        return {
            success: false,
            message: '비밀번호가 일치하지 않습니다'
        }
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email })
    saveToken(token)
    setLastLoginTime()

    return {
        success: true,
        token,
        user,
        message: '로그인 성공'
    }
}

export const logout = (): void => {
    removeToken()
}

export const getCurrentUser = (): User | null => {
    const token = getToken()
    if (!token || !verifyToken(token)) {
        return null
    }

    const payload = decodeToken(token)
    if (!payload || !payload.userId) {
        return null
    }

    return getUserById(payload.userId)
}

export const isAuthenticated = (): boolean => {
    const token = getToken()
    return token !== null && verifyToken(token)
}
