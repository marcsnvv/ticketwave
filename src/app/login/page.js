"use client"

import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import Image from 'next/image';

export default function Login() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')

    const checkUserEmail = async (email) => {
        const { data, error } = await supabase
            .from('users')
            .select('email,company_id')
            .eq('email', email)

        if (error) {
            setError('An error occurred while checking email');
            console.error('Error checking email:', error.message);
            return false
        }

        if (data.length === 0) {
            return false
        } else {
            localStorage.setItem('company_id', data[0].company_id);
            return true
        }
    }

    const handleLogin = async () => {
        const userExists = await checkUserEmail(email);

        if (userExists) {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
                setError(error.message);
            } else {
                alert('Check your email for the login link!');
            }
        } else {
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
        <div className="flex justify-center items-center h-screen">
            <Card className="w-full max-w-md shadow-lg bg-background border border-white/25 rounded-[12px] text-white">
                <CardHeader className="flex flex-col items-center justify-center gap-2">
                    <Image src={"/logo.png"} width={50} height={50} alt="tw logo" />
                    <CardTitle className="text-center text-xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            {/* <Label htmlFor="email" className="mb-2">Email Address</Label> */}
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleLogin} className="w-full">
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
                            onClick={handleDiscordLogin}
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
        </div>
    );
}
