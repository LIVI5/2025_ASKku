import { Notice } from '../types'

const LAST_LOGIN_KEY = 'lastLoginTime'

export const getLastLoginTime = (): string | null => {
    return localStorage.getItem(LAST_LOGIN_KEY)
}

export const setLastLoginTime = (time: string = new Date().toISOString()): void => {
    localStorage.setItem(LAST_LOGIN_KEY, time)
}

export const getNewNotices = (notices: Notice[]): Notice[] => {
    const lastLogin = getLastLoginTime()

    if (!lastLogin) {
        return notices
    }

    const lastLoginDate = new Date(lastLogin)

    return notices.filter(notice => {
        const noticeDate = new Date(notice.date)
        return noticeDate > lastLoginDate
    })
}
