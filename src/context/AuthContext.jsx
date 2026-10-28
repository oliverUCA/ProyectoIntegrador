import React, { createContext, useContext, useState } from 'react';
import axiosClient from '@/api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Se restaura la sesión guardada (si existe) al recargar la página
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user_data');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('jwt-token') || null);
    const [loading, setLoading] = useState(false);

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('jwt-token');
        localStorage.removeItem('user_data');
        //enviar al usuario a la pagina de inicio
        // window.location.href = '/';
    }

    const login = async (credentials) => {
        setLoading(true);
        try {

            const response = await axiosClient.post('/login', credentials);
            //extrae el token y los datos del usuario
            // Dolibarr responde: { success: { code, token, entity, message } }
            const newToken = response.data?.success?.token;
            if (!newToken) throw new Error('El servidor no devolvió un token');
            const userData = { login: credentials.login };

            // Guardamos en le local storage
            localStorage.setItem('jwt-token', newToken);
            localStorage.setItem('user_data', JSON.stringify(userData));

            // Actualizamos el estado para que la app sepa que hay sesión
            setToken(newToken);
            setUser(userData);

            setLoading(false);
            return { success: true };


        } catch (error) {
            setLoading(false);
            // Uso de encademnamiento Opcional en caso de fallas de la peticion
            // Dolibarr devuelve los errores como { error: { code, message } }
            const message =
                error.response?.data?.error?.message ||
                error.response?.data?.message ||
                error.message ||
                'Error de conexion o credenciales invalidas';
            return { success: false, message };

        }
    };

    // variables contexto

    const contextValue = {
        user,
        token,
        loading,
        isAutenticated: !!token,
        login,
        logout

    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )


};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

// export  AuthProvider, useAuth;