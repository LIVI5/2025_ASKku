import { User } from '../types'
import bcrypt from 'bcryptjs'

const USERS_KEY = 'askku_users'
const TOKEN_KEY = 'askku_token'

// User management
export const saveUser = (user: User): void => {
    const users = getAllUsers()
    users.push(user)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const getUserByEmail = (email: string): User | null => {
    const users = getAllUsers()
    return users.find(user => user.email === email) || null
}

export const getUserById = (id: string): User | null => {
    const users = getAllUsers()
    return users.find(user => user.userID === id) || null
}

export const getAllUsers = (): User[] => {
    const usersJson = localStorage.getItem(USERS_KEY)
    return usersJson ? JSON.parse(usersJson) : []
}

// Clear all data (for development/reset)
export const clearAllData = (): void => {
    localStorage.removeItem(USERS_KEY)
    localStorage.removeItem('askku_passwords')
    localStorage.removeItem(TOKEN_KEY)
}

// Password management (stored separately for security)
const PASSWORDS_KEY = 'askku_passwords'
const saltRounds = 10; // For bcrypt hashing

export const savePassword = (userId: string, password: string): void => {
    const passwords = getPasswords()
    // Hash the password before saving
    const hashedPassword = bcrypt.hashSync(password, saltRounds)
    passwords[userId] = hashedPassword
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords))
}

export const verifyPassword = (userId: string, password: string): boolean => {
    const passwords = getPasswords()
    const storedHash = passwords[userId]
    if (!storedHash) {
        return false // No password stored for this user
    }
    // Compare the provided password with the stored hash
    return bcrypt.compareSync(password, storedHash)
}

const getPasswords = (): Record<string, string> => {
    const passwordsJson = localStorage.getItem(PASSWORDS_KEY)
    return passwordsJson ? JSON.parse(passwordsJson) : {}
}

// Token management
export const saveToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
}

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
}

export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY)
}
