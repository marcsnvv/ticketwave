"use client"

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../supabase';

export default function Settings() {
    const router = useRouter()

    const [imageUrl, setImageUrl] = useState('');
    const [companyTitle, setCompanyTitle] = useState('');
    const [color, setColor] = useState('#000000');

    const saveSettings = async () => {
        const { error } = await supabase
            .from('notification_settings')
            .upsert([{
                company_title: companyTitle,
                image_url: imageUrl,
                color: color
            }]);

        if (error) {
            console.error('Error saving settings:', error);
        } else {
            alert('Settings saved successfully!');
        }
    }

    useEffect(() => {
        async function getData() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router("/login")
            }
        }

        getData()
    }, [])

    return (
        <div className="container mx-auto p-4">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyTitle">Company Title</Label>
                            <Input
                                id="companyTitle"
                                placeholder="Enter your company title"
                                value={companyTitle}
                                onChange={(e) => setCompanyTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                                id="imageUrl"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Notification Color</Label>
                            <Input
                                id="color"
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
                        </div>

                        <Button onClick={saveSettings} className="w-full mt-4">
                            Save Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
