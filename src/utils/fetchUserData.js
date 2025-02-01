import { supabase } from '../../supabase';

export async function fetchUserData(email) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id,name,email,avatar_url,company_id,companies(name),companies_access(company_id,companies(name,notification_settings(*)))')
            .eq('email', email)
            .single();

        if (error) {
            console.error('Error fetching user data:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Unexpected error fetching user data:', error);
        return null;
    }
}