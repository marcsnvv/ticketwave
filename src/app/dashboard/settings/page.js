"use client"

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../supabase'
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash, WebhookIcon, SearchIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"

export default function Settings() {
    const router = useRouter()
    const { toast } = useToast()

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
    const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false)
    const [editChannelDialogOpen, setEditChannelDialogOpen] = useState(false)
    const [editError, setEditError] = useState("")
    const [roleSearch, setRoleSearch] = useState("")
    const [channelSearch, setChannelSearch] = useState("")
    const [visibleRoles, setVisibleRoles] = useState(9)
    const [visibleChannels, setVisibleChannels] = useState(9)
    const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false)
    const [addChannelDialogOpen, setAddChannelDialogOpen] = useState(false)
    const [testDialogOpen, setTestDialogOpen] = useState(false)
    const [selectedChannel, setSelectedChannel] = useState("")
    const [sendingTest, setSendingTest] = useState(false)

    const saveSettings = async () => {
        // First check if a record exists
        const { data: existingSettings } = await supabase
            .from('notification_settings')
            .select()
            .eq("company_id", localStorage.getItem("company_id"))

        // Prepare the data object
        const settingsData = {
            company_title: companyTitle,
            image_url: imageUrl,
            color: color,
            company_id: localStorage.getItem("company_id")
        }

        // Choose insert or update based on existence
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

    useEffect(() => {
        async function getData() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router("/login")
            }

            const { data, error } = await supabase
                .from("notification_settings")
                .select("company_title,image_url,color")
                .eq("company_id", localStorage.getItem("company_id"))

            if (error) {
                console.error(error)
            }

            setColor(data?.[0]?.color)
            setCompanyTitle(data?.[0]?.company_title)
            setImageUrl(data?.[0]?.image_url)
        }

        getData()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            const { data: rolesData } = await supabase.from('roles').select('*').eq('company_id', localStorage.getItem("company_id"))
            const { data: channelsData } = await supabase.from('channels').select('*').eq('company_id', localStorage.getItem("company_id"))
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
            toast({
                variant: "destructive",
                title: "Error",
                description: "Role ID is required"
            })
            return
        }

        const duplicateRole = roles.find(
            role => role.role_id === newRole.role_id
        )
        if (duplicateRole) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "A role with this ID already exists"
            })
            return
        }

        const { data, error } = await supabase
            .from('roles')
            .insert([{ ...newRole, color: getPastelColor(), company_id: localStorage.getItem("company_id") }])
            .select()

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error adding role"
            })
        } else {
            setRoles([...roles, data[0]])
            setNewRole({ title: '', role_id: '' })
            setAddRoleDialogOpen(false)
            toast({
                title: "Success",
                description: "Role added successfully"
            })
        }
    }

    const updateRole = async (id) => {
        const { error } = await supabase
            .from('roles')
            .update(editingRole)
            .eq('id', id)
            .eq('company_id', localStorage.getItem("company_id"))

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
            .eq('company_id', localStorage.getItem("company_id"))

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error deleting role"
            })
        } else {
            setRoles(roles.filter(role => role.id !== id))
            toast({
                title: "Success",
                description: "Role deleted successfully"
            })
        }
    }

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

        const companyId = localStorage.getItem("company_id")
        console.log(companyId)

        const { data, error } = await supabase
            .from('channels')
            .insert([{ ...newChannel, company_id: companyId }])
        // .select()
        // .eq('company_id', localStorage.getItem("company_id"))

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error adding channel " + error.message
            })
        } else {
            setChannels([...channels, data?.[0]])
            setNewChannel({ title: '', webhook_url: '' })
            setAddChannelDialogOpen(false)
            toast({
                title: "Success",
                description: "Channel added successfully"
            })
        }
    }

    const updateChannel = async (id) => {
        const { error } = await supabase
            .from('channels')
            .update(editingChannel)
            .eq('id', id)
            .eq('company_id', localStorage.getItem("company_id"))

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
            .eq('company_id', localStorage.getItem("company_id"))

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error deleting channel " + error.message
            })
        } else {
            setChannels(channels.filter(channel => channel.id !== id))
            toast({
                title: "Success",
                description: "Channel deleted successfully"
            })
        }
    }

    const handleEditRole = (role) => {
        setEditingRole(role)
        setEditRoleDialogOpen(true)
        setEditError("")
    }

    const handleEditChannel = (channel) => {
        setEditingChannel(channel)
        setEditChannelDialogOpen(true)
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
                role_id: editingRole.role_id,
            })
            .eq('id', editingRole.id)
            .eq('company_id', localStorage.getItem("company_id"))

        if (!error) {
            setRoles(roles.map(role =>
                role.id === editingRole.id ? editingRole : role
            ))
            setEditRoleDialogOpen(false)
            setEditingRole(null)
            setEditError("")
        }
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

    const sendTestMessage = async () => {
        if (!selectedChannel) return;

        setSendingTest(true)
        try {
            const channel = channels.find(c => c.id === selectedChannel);
            if (!channel) return;

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
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Test message sent successfully!"
                })
                setTestDialogOpen(false);
                setSelectedChannel("");
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
            setSendingTest(false);
        }
    };

    const filteredRoles = roles
        .filter(role => role?.title.toLowerCase().includes(roleSearch.toLowerCase()))
        .sort((a, b) => a.title.localeCompare(b.title))

    const filteredChannels = channels
        .filter(channel => channel?.title.toLowerCase().includes(channelSearch.toLowerCase()))
        .sort((a, b) => a.title.localeCompare(b.title))

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
        );
    };

    return (
        <main className='flex items-center justify-center lg:mx-48 p-5'>
            <div className="container mx-auto">
                <div className="space-y-8 mb-8 ">
                    {/* Roles Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Roles</h3>
                        <div className="flex gap-4">
                            <div className="w-4/5">
                                <SearchIcon className="h-4 w-4 absolute ml-2.5 mt-2.5" />
                                <Input
                                    className="pl-8"
                                    placeholder="Search Roles"
                                    value={roleSearch}
                                    onChange={(e) => setRoleSearch(e.target.value)}
                                />
                            </div>
                            <Button className="w-1/5" onClick={() => setAddRoleDialogOpen(true)}>
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
                                        <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
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
                        <div className="flex gap-4">
                            <div className="w-4/5">
                                <SearchIcon className="h-4 w-4 absolute ml-2.5 mt-2.5" />
                                <Input
                                    className="pl-8"
                                    placeholder="Search Channels"
                                    value={channelSearch}
                                    onChange={(e) => setChannelSearch(e.target.value)}
                                />
                            </div>
                            <Button className="w-1/5" onClick={() => setAddChannelDialogOpen(true)}>
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

                <div className="flex gap-8">
                    {/* Settings Section - 2/5 width */}
                    <div className="w-2/5">
                        <h3 className="text-lg font-medium mb-4">Webhook Customization</h3>
                        <Card className="shadow-md">
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

                    {/* Preview Section - 3/5 width */}
                    <div className="w-3/5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Preview</h3>
                            <Button onClick={() => setTestDialogOpen(true)}>
                                Send Test Message
                            </Button>
                        </div>
                        <div className="bg-[#2f3136] p-6 rounded-lg">
                            <DiscordPreview
                                title={companyTitle}
                                imageUrl={imageUrl}
                                color={color}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Role Dialog */}
            <Dialog open={editRoleDialogOpen} onOpenChange={setEditRoleDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role-title">Title</Label>
                            <Input
                                id="edit-role-title"
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
            <Dialog open={editChannelDialogOpen} onOpenChange={setEditChannelDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Channel</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-channel-title">Title</Label>
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
                        <Button onClick={handleUpdateChannel}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Role Dialog */}
            <Dialog open={addRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Role</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-title">Title</Label>
                            <Input
                                id="add-title"
                                value={newRole.title}
                                onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-role-id">Role ID *</Label>
                            <Input
                                id="add-role-id"
                                value={newRole.role_id}
                                onChange={(e) => setNewRole({ ...newRole, role_id: e.target.value })}
                                className={roleError ? "border-red-500" : ""}
                            />
                            {roleError && <span className="text-sm text-red-500">{roleError}</span>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => {
                            addRole();
                            if (!roleError) setAddRoleDialogOpen(false);
                        }}>Add Role</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Channel Dialog */}
            <Dialog open={addChannelDialogOpen} onOpenChange={setAddChannelDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Channel</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-channel-title">Title</Label>
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
                        <Button onClick={() => {
                            addChannel();
                            if (!channelError) setAddChannelDialogOpen(false);
                        }}>Add Channel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
        </main>
    );
}
