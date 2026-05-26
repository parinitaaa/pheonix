import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { loginUser, registerUser, getProfile } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('infinity_user');
        return u ? JSON.parse(u) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('infinity_token'));
    const [loading, setLoading] = useState(false);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const { data } = await loginUser({ email, password });
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('infinity_token', data.token);
            localStorage.setItem('infinity_user', JSON.stringify(data.user));
            toast.success(`Welcome back, ${data.user.name}! 🔥`);
            return data.user;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (name, email, password) => {
        setLoading(true);
        try {
            const { data } = await registerUser({ name, email, password });
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('infinity_token', data.token);
            localStorage.setItem('infinity_user', JSON.stringify(data.user));
            toast.success(`Welcome to INFINITY, ${data.user.name}! ✨`);
            return data.user;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('infinity_token');
        localStorage.removeItem('infinity_user');
        toast.success('Logged out successfully');
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const { data } = await getProfile();
            setUser(data.user);
            localStorage.setItem('infinity_user', JSON.stringify(data.user));
        } catch { }
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin: user?.role === 'admin'
    }), [user, token, loading, login, register, logout, refreshUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
