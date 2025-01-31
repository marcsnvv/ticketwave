"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from "@/hooks/use-toast"
import { supabase } from '../../../../../supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CustomizationSection() {
    const { toast } = useToast()
    const [imageUrl, setImageUrl] = useState('')
    const [companyTitle, setCompanyTitle] = useState('')
    const [color, setColor] = useState('#000000')
    const [testDialogOpen, setTestDialogOpen] = useState(false)
    const [selectedChannel, setSelectedChannel] = useState("")
    const [sendingTest, setSendingTest] = useState(false)
    const [channels, setChannels] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const [channelsResponse, settingsResponse] = await Promise.all([
                supabase.from('channels').select('*').eq('company_id', localStorage.getItem("company_id")),
                supabase.from('notification_settings').select('*').eq('company_id', localStorage.getItem("company_id"))
            ])

            setChannels(channelsResponse.data || [])
            if (settingsResponse.data?.[0]) {
                setCompanyTitle(settingsResponse.data[0].company_title)
                setImageUrl(settingsResponse.data[0].image_url)
                setColor(settingsResponse.data[0].color)
            }
        }
        fetchData()
    }, [])

    const saveSettings = async () => {
        const { data: existingSettings } = await supabase
            .from('notification_settings')
            .select()
            .eq("company_id", localStorage.getItem("company_id"))

        const settingsData = {
            company_title: companyTitle,
            image_url: imageUrl,
            color: color,
            company_id: localStorage.getItem("company_id")
        }

        const { error } = existingSettings?.length > 0
            ? await supabase
                .from('notification_settings')
                .update([settingsData])
                .eq("company_id", localStorage.getItem("company_id"))
            : await supabase
                .from('notification_settings')
                .insert([settingsData])

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error saving settings: " + error.message
            })
        } else {
            toast({
                title: "Success",
                description: "Settings saved successfully!"
            })
        }
    }

    const sendTestMessage = async () => {
        if (!selectedChannel) return

        setSendingTest(true)
        try {
            const channel = channels.find(c => c.id === selectedChannel)
            if (!channel) return

            const response = await fetch(channel.webhook_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    embeds: [{
                        title: `Test message from ${companyTitle || "Webhook"}`,
                        description: "This is a test message to verify the webhook configuration. If you're seeing this, the webhook is working correctly! 🎉",
                        color: parseInt(color.replace('#', ''), 16),
                    }],
                    username: companyTitle,
                    avatar_url: imageUrl,
                }),
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Test message sent successfully!"
                })
                setTestDialogOpen(false)
                setSelectedChannel("")
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to send test message"
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error sending test message"
            })
        } finally {
            setSendingTest(false)
        }
    }

    const DiscordPreview = ({ title, imageUrl, color }) => {
        return (
            <div className="bg-[#36393f] rounded-md p-4 text-white">
                <div className="border-l-4 pl-3" style={{ borderColor: color }}>
                    <div className="flex items-start space-x-4">
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Webhook Avatar"
                                className="w-10 h-10 rounded-full"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold">{title || 'Webhook Name'}</span>
                                <span className="px-1 rounded-sm bg-blue-500 text-xs text-white">APP</span>
                            </div>
                            <div className="mt-2">
                                <div className="bg-[#2f3136] rounded p-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1 h-full" style={{ backgroundColor: color }}></div>
                                        <div>
                                            <p className="text-sm">Example notification message</p>
                                            <p className="text-xs text-gray-400 mt-1">This is how your webhook will appear</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex gap-8 flex-col lg:flex-row w-full flex-start justify-start">
            <div className="w-full lg:w-1/2">
                <Card className="border border-white/25 rounded-[12px] text-white">
                    <CardContent className="pt-6">
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
                                <Label htmlFor="color">Accent Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-20"
                                    />
                                    <Input
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <Button onClick={saveSettings} className="w-full mt-4">
                                Save Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full lg:w-1/2">
                <div className='flex items-center justify-between mb-2'>
                    <h3 className="text-lg font-medium mb-4 text-white">Preview</h3>
                    <div className="flex justify-between items-center">
                        <Button onClick={() => setTestDialogOpen(true)}>
                            Send Test Message
                        </Button>
                    </div>
                </div>
                <div className="bg-[#2f3136] p-6 rounded-lg border border-white/25">
                    <DiscordPreview
                        title={companyTitle}
                        imageUrl={imageUrl}
                        color={color}
                    />
                </div>

            </div>
            {/* Test Message Dialog */}
            <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Send Test Message</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="channel-select">Select Channel</Label>
                            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a channel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {channels.map((channel) => (
                                        <SelectItem key={channel.id} value={channel.id}>
                                            {channel.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={sendTestMessage}
                            disabled={!selectedChannel || sendingTest}
                        >
                            {sendingTest ? "Sending..." : "Send Test"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}