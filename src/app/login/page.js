"use client"

import { useState } from 'react';
import { supabase } from '../../../supabase'

emailList = [
    "busines1244@gmail.com",
    "marcsnvv@gmail.com"
]

export default function Login() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
            setError(error.message);
        } else {
            if (emailList.includes(email)) {
                alert('Check your email for the login link!');
            } else {
                alert("Access denied")
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-full max-w-xs">
                <h2 className="text-2xl mb-4 text-center">Login with OTP</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="mb-4 p-2 border"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    onClick={handleLogin}
                    className="bg-blue-500 text-white p-2 w-full"
                >
                    Send Login Link
                </button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </div>
    );
}
