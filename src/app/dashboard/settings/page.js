"use client"

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../supabase'
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash, WebhookIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export default function Settings() {
    const router = useRouter()

    const [imageUrl, setImageUrl] = useState('');
    const [companyTitle, setCompanyTitle] = useState('');
    const [color, setColor] = useState('#000000');
    const [roles, setRoles] = useState([])
    const [channels, setChannels] = useState([])
    const [newRole, setNewRole] = useState({ title: '', role_id: '' })
    const [newChannel, setNewChannel] = useState({ title: '', webhook_url: '' })
    const [editingRole, setEditingRole] = useState(null)
    const [editingChannel, setEditingChannel] = useState(null)
    const [roleError, setRoleError] = useState("")
    const [channelError, setChannelError] = useState("")
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editError, setEditError] = useState("")
    const [roleSearch, setRoleSearch] = useState("")
    const [channelSearch, setChannelSearch] = useState("")
    const [visibleRoles, setVisibleRoles] = useState(9)
    const [visibleChannels, setVisibleChannels] = useState(9)

    const saveSettings = async () => {
        const { error } = await supabase
            .from('notification_settings')
            .update([{
                company_title: companyTitle,
                image_url: imageUrl,
                color: color
            }])
            .eq("company_id", "33b414df-7509-462e-9f8f-3709ec77eabf")

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

            const { data, error } = await supabase
                .from("notification_settings")
                .select("company_title,image_url,color")
                .eq("company_id", "33b414df-7509-462e-9f8f-3709ec77eabf")

            if (error) {
                console.error(error)
            }
            console.log(data)

            setColor(data[0].color)
            setCompanyTitle(data[0].company_title)
            setImageUrl(data[0].image_url)
        }

        getData()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            const { data: rolesData } = await supabase.from('roles').select('*')
            const { data: channelsData } = await supabase.from('channels').select('*')
            setRoles(rolesData || [])
            setChannels(channelsData || [])
        }
        fetchData()
    }, [])

    const getPastelColor = () => {
        const hue = Math.floor(Math.random() * 360)
        return `hsl(${hue}, 70%, 80%)`
    }

    const addRole = async () => {
        setRoleError("")

        if (!newRole.role_id) {
            setRoleError("Role ID is required")
            return
        }

        // Check for duplicate role_id
        const duplicateRole = roles.find(
            role => role.role_id === newRole.role_id
        )
        if (duplicateRole) {
            setRoleError("A role with this ID already exists")
            return
        }

        const { data, error } = await supabase
            .from('roles')
            .insert([{ ...newRole, color: getPastelColor() }])
            .select()

        if (!error) {
            setRoles([...roles, data[0]])
            setNewRole({ title: '', role_id: '' })
        }
    }

    const updateRole = async (id) => {
        const { error } = await supabase
            .from('roles')
            .update(editingRole)
            .eq('id', id)

        if (!error) {
            setRoles(roles.map(role => role.id === id ? editingRole : role))
            setEditingRole(null)
        }
    }

    const deleteRole = async (id) => {
        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('id', id)

        if (!error) {
            setRoles(roles.filter(role => role.id !== id))
        }
    }

    const addChannel = async () => {
        setChannelError("")

        if (!newChannel.webhook_url) {
            setChannelError("Webhook URL is required")
            return
        }

        // Check for duplicate webhook_url
        const duplicateChannel = channels.find(
            channel => channel.webhook_url === newChannel.webhook_url
        )
        if (duplicateChannel) {
            setChannelError("A channel with this webhook URL already exists")
            return
        }

        const { data, error } = await supabase
            .from('channels')
            .insert([newChannel])
            .select()

        if (!error) {
            setChannels([...channels, data[0]])
            setNewChannel({ title: '', webhook_url: '' })
        }
    }

    const updateChannel = async (id) => {
        const { error } = await supabase
            .from('channels')
            .update(editingChannel)
            .eq('id', id)

        if (!error) {
            setChannels(channels.map(channel => channel.id === id ? editingChannel : channel))
            setEditingChannel(null)
        }
    }

    const deleteChannel = async (id) => {
        const { error } = await supabase
            .from('channels')
            .delete()
            .eq('id', id)

        if (!error) {
            setChannels(channels.filter(channel => channel.id !== id))
        }
    }

    const handleEdit = (role) => {
        setEditingRole(role)
        setEditDialogOpen(true)
        setEditError("")
    }

    const handleUpdate = async () => {
        if (!editingRole.role_id) {
            setEditError("Role ID is required")
            return
        }

        // Check for duplicate role_id excluding current role
        const duplicateRole = roles.find(
            role => role.role_id === editingRole.role_id
                && role.id !== editingRole.id
        )
        if (duplicateRole) {
            setEditError("A role with this ID already exists")
            return
        }

        const { error } = await supabase
            .from('roles')
            .update({
                title: editingRole.title,
                role_id: editingRole.role_id
            })
            .eq('id', editingRole.id)

        if (!error) {
            setRoles(roles.map(role =>
                role.id === editingRole.id ? editingRole : role
            ))
            setEditDialogOpen(false)
            setEditingRole(null)
            setEditError("")
        }
    }

    const handleEditChannel = (channel) => {
        setEditingChannel(channel)
        setEditDialogOpen(true)
        setEditError("")
    }

    const handleUpdateChannel = async () => {
        if (!editingChannel.webhook_url) {
            setEditError("Webhook URL is required")
            return
        }

        // Check for duplicate webhook_url excluding current channel
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
                webhook_url: editingChannel.webhook_url
            })
            .eq('id', editingChannel.id)

        if (!error) {
            setChannels(channels.map(channel =>
                channel.id === editingChannel.id ? editingChannel : channel
            ))
            setEditDialogOpen(false)
            setEditingChannel(null)
            setEditError("")
        }
    }

    const filteredRoles = roles.filter(role => role.title.toLowerCase().includes(roleSearch.toLowerCase()))
    const filteredChannels = channels.filter(channel => channel.title.toLowerCase().includes(channelSearch.toLowerCase()))

    return (
        <main className='flex items-center justify-center mx-48 p-5'>
            <div className="container mx-auto">
                <div className="space-y-8 mb-8 ">
                    {/* Roles Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Roles</h3>
                        <Input
                            placeholder="Search Roles"
                            value={roleSearch}
                            onChange={(e) => setRoleSearch(e.target.value)}
                        />
                        <div className="flex justify-between gap-4">
                            <div className='w-full'>
                                <Input
                                    placeholder="Title"
                                    value={newRole.title}
                                    onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
                                />
                            </div>
                            <div className='w-full'>
                                <Input
                                    placeholder="Role ID *"
                                    value={newRole.role_id}
                                    onChange={(e) => setNewRole({ ...newRole, role_id: e.target.value })}
                                    className={roleError ? "border-red-500" : ""}
                                />
                                {roleError && <span className="text-sm text-red-500">{roleError}</span>}
                            </div>
                            <Button onClick={addRole}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Role
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                            {filteredRoles.slice(0, visibleRoles).map((role) => (
                                <div key={role.id} className="flex items-center justify-between p-2 border rounded hover:shadow-sm">
                                    <Badge style={{ backgroundColor: role.color }}>
                                        {role.title}
                                    </Badge>
                                    <div className="flex">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => deleteRole(role.id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredRoles.length > visibleRoles && (
                            <Button className="" variant="ghost" onClick={() => setVisibleRoles(visibleRoles + 9)}>
                                Show more
                            </Button>
                        )}
                    </div>

                    {/* Channels Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Channels</h3>
                        <Input
                            placeholder="Search Channels"
                            value={channelSearch}
                            onChange={(e) => setChannelSearch(e.target.value)}
                        />
                        <div className="flex justify-between gap-4">
                            <div className='w-full'>
                                <Input
                                    placeholder="Title"
                                    value={newChannel.title}
                                    onChange={(e) => setNewChannel({ ...newChannel, title: e.target.value })}
                                />
                            </div>
                            <div className='w-full'>
                                <Input
                                    placeholder="Webhook URL *"
                                    value={newChannel.webhook_url}
                                    onChange={(e) => setNewChannel({ ...newChannel, webhook_url: e.target.value })}
                                    className={channelError ? "border-red-500" : ""}
                                />
                                {channelError && <span className="text-sm text-red-500">{channelError}</span>}
                            </div>
                            <Button onClick={addChannel}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Channel
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredChannels.slice(0, visibleChannels).map((channel) => (
                                <div key={channel.id} className="flex items-center justify-between p-2 border rounded">
                                    <div className='flex gap-2 items-center justify-center'>
                                        <WebhookIcon className='h-5 w-5' />
                                        <span>{channel.title}</span>
                                    </div>
                                    <div className="flex">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditChannel(channel)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => deleteChannel(channel.id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredChannels.length > visibleChannels && (
                            <Button variant="ghost" onClick={() => setVisibleChannels(visibleChannels + 9)}>
                                Show more
                            </Button>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-medium mb-4">Embed</h3>
                {/* Lista de canales */}
                <div className="container mx-auto">
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
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editingRole?.title || ''}
                                onChange={(e) => setEditingRole({
                                    ...editingRole,
                                    title: e.target.value
                                })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role-id">Role ID *</Label>
                            <Input
                                id="edit-role-id"
                                value={editingRole?.role_id || ''}
                                onChange={(e) => setEditingRole({
                                    ...editingRole,
                                    role_id: e.target.value
                                })}
                                className={editError ? "border-red-500" : ""}
                            />
                            {editError && <span className="text-sm text-red-500">{editError}</span>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Channel Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Channel</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editingChannel?.title || ''}
                                onChange={(e) => setEditingChannel({
                                    ...editingChannel,
                                    title: e.target.value
                                })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-webhook">Webhook URL *</Label>
                            <Input
                                id="edit-webhook"
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
                        <Button onClick={handleUpdateChannel}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
