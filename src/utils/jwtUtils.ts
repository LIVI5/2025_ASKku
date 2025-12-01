// Simple JWT-like token generation (for demo purposes)
// In production, JWT should be generated and verified by backend

const SECRET_KEY = 'askku-secret-key-2025'

export const generateToken = (payload: any): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })) // 24 hours
    const signature = btoa(`${header}.${body}.${SECRET_KEY}`)

    return `${header}.${body}.${signature}`
}

export const decodeToken = (token: string): any => {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null

        const payload = JSON.parse(atob(parts[1]))
        return payload
    } catch (error) {
        return null
    }
}

export const verifyToken = (token: string): boolean => {
    try {
        const payload = decodeToken(token)
        if (!payload) return false

        // Check expiration
        if (payload.exp && payload.exp < Date.now()) {
            return false
        }

        return true
    } catch (error) {
        return false
    }
}
