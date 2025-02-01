"use client"

import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import Image from 'next/image';

export default function Login() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isCooldown, setIsCooldown] = useState(false);

    useEffect(() => {
        // Check if there's an active cooldown on component mount
        const cooldownStart = localStorage.getItem('cooldownStart');
        if (cooldownStart) {
            const timeElapsed = Date.now() - parseInt(cooldownStart, 10);
            if (timeElapsed < 300000) { // 5 minutes in milliseconds
                setIsCooldown(true);
                setError('Too many failed attempts. Please try again in 5 minutes.');
                setTimeout(() => {
                    setFailedAttempts(0);
                    setIsCooldown(false);
                    setError('');
                    localStorage.removeItem('cooldownStart');
                }, 300000 - timeElapsed);
            } else {
                localStorage.removeItem('cooldownStart');
            }
        }
    }, []);

    useEffect(() => {
        if (failedAttempts >= 3) {
            setIsCooldown(true);
            setError('Too many failed attempts. Please try again in 5 minutes.');
            const cooldownStart = Date.now();
            localStorage.setItem('cooldownStart', cooldownStart.toString());

            const cooldownTimer = setTimeout(() => {
                setFailedAttempts(0);
                setIsCooldown(false);
                setError('');
                localStorage.removeItem('cooldownStart');
            }, 300000); // 5 minutes in milliseconds

            return () => clearTimeout(cooldownTimer);
        }
    }, [failedAttempts]);

    const checkUserEmail = async (email) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (error) {
            console.error('Error fetching users:', error);
            return false;
        }

        return data.length > 0;
    };

    const handleLogin = async () => {
        if (isCooldown) return;

        const userExists = await checkUserEmail(email);

        if (userExists) {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
                setError(error.message);
            } else {
                setError('Success - Check your email for the login link!');
            }
        } else {
            setFailedAttempts(prev => prev + 1);
            setError('Access denied - Email not authorized');
        }
    };

    const handleDiscordLogin = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    scopes: 'guilds guilds.members.read',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) throw error;

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <main className="flex justify-center items-center h-screen">
            <Card className="w-full max-w-md shadow-lg bg-background border border-white/25 rounded-[12px] text-white">
                <CardHeader className="flex flex-col items-center justify-center gap-2">
                    <Image src={"/logo.png"} width={50} height={50} alt="tw logo" />
                    <CardTitle className="text-center text-xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <Button onClick={() => handleLogin()} className="w-full">
                            Send Login Link
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-background text-gray-300">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            onClick={() => handleDiscordLogin()}
                            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                        >
                            <DiscordLogoIcon className="mr-2 h-5 w-5" />
                            Login with Discord
                        </Button>

                        {error && (
                            <Alert variant="destructive" className="mt-4">
                                {error}
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
