"use client"

import { useState } from 'react';
import { supabase } from '../../../supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import Image from 'next/image';

export default function Login() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const emailList = [
        "busines1244@gmail.com",
        "marcsnvv@gmail.com",
        "vaskotomas6@gmail.com",
        "jozi71mut@seznam.cz",
        "timotej.liskay@gmail.com",
    ];

    const handleLogin = async () => {
        if (emailList.includes(email)) {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
                setError(error.message);
            } else {
                alert('Check your email for the login link!');
            }
        } else {
            setError('Access denied');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="flex flex-col items-center justify-center gap-2">
                    <Image src={"/logo.png"} width={50} height={50} alt="tw logo" />
                    <CardTitle className="text-center text-xl">Login with OTP</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email" className="mb-2">Email Address</Label>
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
