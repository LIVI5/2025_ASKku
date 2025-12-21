import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useRef } from 'react';
import { User } from '../types';
import { getUserInfo } from '../services/authService';
import { clearSession, clearAllBookmarks } from '../services/chatService'; // Import clearSession and clearAllBookmarks

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const previousUserId = useRef<string | null>(null); // To track user ID changes

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const userData = await getUserInfo();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Effect to clear chat session on user change
    useEffect(() => {
        const currentUserId = user?.userID || null;
        if (currentUserId !== previousUserId.current) {
            console.log(`User ID changed from ${previousUserId.current} to ${currentUserId}. Clearing chat session and bookmarks.`);
            clearSession();
            clearAllBookmarks(); // Also clear locally cached bookmarks
            previousUserId.current = currentUserId;
        }
    }, [user]); // Rerun when the user object changes

    return (
        <UserContext.Provider value={{ user, setUser, loading, fetchUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
