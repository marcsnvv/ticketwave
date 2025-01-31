"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { WebhookIcon } from 'lucide-react'
import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from "@/hooks/use-toast"
import { supabase } from '../../../../../supabase'

export function ChannelsSection() {
    const { toast } = useToast()
    const [channels, setChannels] = useState([])
    const [newChannel, setNewChannel] = useState({ title: '', webhook_url: '' })
    const [editingChannel, setEditingChannel] = useState(null)
    const [channelError, setChannelError] = useState("")
    const [editChannelDialogOpen, setEditChannelDialogOpen] = useState(false)
    const [editError, setEditError] = useState("")
    const [channelSearch, setChannelSearch] = useState("")
    const [addChannelDialogOpen, setAddChannelDialogOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const [channelsResponse, settingsResponse] = await Promise.all([
                supabase.from('channels').select('*').eq('company_id', localStorage.getItem("company_id")),
            ])

            setChannels(channelsResponse.data || [])
        }
        fetchData()
    }, [])

    const addChannel = async () => {
        setChannelError("")

        if (!newChannel.webhook_url) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Webhook URL is required"
            })
            return
        }

        const duplicateChannel = channels.find(
            channel => channel.webhook_url === newChannel.webhook_url
        )
        if (duplicateChannel) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "A channel with this webhook URL already exists"
            })
            return
        }

        const { data, error } = await supabase
            .from('channels')
            .insert([{ ...newChannel, company_id: localStorage.getItem("company_id") }])
            .select()

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error adding channel: " + error.message
            })
        } else {
            setChannels([...channels, data[0]])
            setNewChannel({ title: '', webhook_url: '' })
            setAddChannelDialogOpen(false)
            toast({
                title: "Success",
                description: "Channel added successfully"
            })
        }
    }

    const handleEditChannel = (channel) => {
        setEditingChannel(channel)
        setEditChannelDialogOpen(true)
        setEditError("")
    }

    const handleUpdateChannel = async () => {
        if (!editingChannel.webhook_url) {
            setEditError("Webhook URL is required")
            return
        }

        const duplicateChannel = channels.find(
            channel => channel.webhook_url === editingChannel.webhook_url
                && channel.id !== editingChannel.id
        )
        if (duplicateChannel) {
            setEditError("A channel with this webhook URL already exists")
            return
        }

        const { error } = await supabase
            .from('channels')
            .update({
                title: editingChannel.title,
                webhook_url: editingChannel.webhook_url,
            })
            .eq('id', editingChannel.id)
            .eq('company_id', localStorage.getItem("company_id"))

        if (!error) {
            setChannels(channels.map(channel =>
                channel.id === editingChannel.id ? editingChannel : channel
            ))
            setEditChannelDialogOpen(false)
            setEditingChannel(null)
            setEditError("")
        }
    }

    const deleteChannel = async (id) => {
        const { error } = await supabase
            .from('channels')
            .delete()
            .eq('id', id)
            .eq('company_id', localStorage.getItem("company_id"))

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error deleting channel: " + error.message
            })
        } else {
            setChannels(channels.filter(channel => channel.id !== id))
            toast({
                title: "Success",
                description: "Channel deleted successfully"
            })
        }
    }



    const filteredChannels = channels
        .filter(channel => channel?.title.toLowerCase().includes(channelSearch.toLowerCase()))
        .sort((a, b) => a.title.localeCompare(b.title))

    return (
        <div className="space-y-4 w-full min-h-full">

            <div className="flex justify-between gap-4">
                <div className="w-4/5">
                    <MagnifyingGlassIcon className="absolute mt-2 ml-2 text-white/25 h-5 w-5" />
                    <Input
                        className="pl-8 max-w-64"
                        placeholder="Search Channels"
                        value={channelSearch}
                        onChange={(e) => setChannelSearch(e.target.value)}
                    />
                </div>
                <Button className="max-w-48" onClick={() => setAddChannelDialogOpen(true)}>
                    {/* <Plus className="h-4 w-4 mr-2" /> */}
                    <span className="hidden lg:block">Add Channel</span>
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {filteredChannels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-2 border border-white/25 rounded-lg text-white">
                        <div className='flex gap-2 items-center justify-center'>
                            <WebhookIcon className='h-5 w-5' />
                            <span>{channel.title}</span>
                        </div>
                        <div className="flex">
                            <button
                                className='p-2 text-white hover:text-white/50'
                                onClick={() => handleEditChannel(channel)}
                            >
                                <Pencil1Icon className='h-4 w-4' />
                            </button>
                            <button
                                className='p-2 text-white hover:text-error'
                                onClick={() => deleteChannel(channel.id)}
                            >
                                <TrashIcon className='h-4 w-4' />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {/* {filteredChannels.length > visibleChannels && (
                <Button variant="ghost" onClick={() => setVisibleChannels(visibleChannels + 9)}>
                    Show more
                </Button>
            )} */}

            {/* Add Channel Dialog */}
            <Dialog open={addChannelDialogOpen} onOpenChange={setAddChannelDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Channel</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-channel-title">Channel Name *</Label>
                            <Input
                                id="add-channel-title"
                                value={newChannel.title}
                                onChange={(e) => setNewChannel({ ...newChannel, title: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-webhook">Webhook URL *</Label>
                            <Input
                                id="add-webhook"
                                value={newChannel.webhook_url}
                                onChange={(e) => setNewChannel({ ...newChannel, webhook_url: e.target.value })}
                                className={channelError ? "border-red-500" : ""}
                            />
                            {channelError && <span className="text-sm text-red-500">{channelError}</span>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddChannelDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={addChannel}>Add Channel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Channel Dialog */}
            <Dialog open={editChannelDialogOpen} onOpenChange={setEditChannelDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Channel</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-channel-title">Channel Name *</Label>
                            <Input
                                id="edit-channel-title"
                                value={editingChannel?.title || ''}
                                onChange={(e) => setEditingChannel({
                                    ...editingChannel,
                                    title: e.target.value
                                })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-channel-webhook">Webhook URL *</Label>
                            <Input
                                id="edit-channel-webhook"
                                value={editingChannel?.webhook_url || ''}
                                onChange={(e) => setEditingChannel({
                                    ...editingChannel,
                                    webhook_url: e.target.value
                                })}
                                className={editError ? "border-red-500" : ""}
                            />
                            {editError && <span className="text-sm text-red-500">{editError}</span>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditChannelDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateChannel}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}