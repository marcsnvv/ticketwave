import React, { createContext, useState, useEffect } from 'react';
import { supabase } from './../../supabase';
import { fetchUserData } from '../utils/fetchUserData';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                if (admins_emails.includes(authUser.email)) {
                    setIsAdmin(true);
                }

                const userData = await fetchUserData(authUser.email);
                if (userData) {
                    const accessibleCompanies = userData.companies_access?.map(access => ({
                        id: access.company_id,
                        name: access.companies?.name,
                        image_url: access.companies?.notification_settings?.[0]?.image_url,
                        color: access.companies?.notification_settings?.[0]?.color
                    })) || [];
                    setCompanies(accessibleCompanies);
                    setUser(userData);
                }
            }
        }

        fetchData();
    }, []);

    return (
        <UserContext.Provider value={{ user, isAdmin, companies }}>
            {children}
        </UserContext.Provider>
    );
};