"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from "@/components/ui/badge"
import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from "@/hooks/use-toast"
import { supabase } from '../../../../../supabase'

export function RolesSection() {
    const { toast } = useToast()
    const [roles, setRoles] = useState([])
    const [newRole, setNewRole] = useState({ title: '', role_id: '' })
    const [editingRole, setEditingRole] = useState(null)
    const [roleError, setRoleError] = useState("")
    const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false)
    const [editError, setEditError] = useState("")
    const [roleSearch, setRoleSearch] = useState("")
    const [visibleRoles, setVisibleRoles] = useState(9)
    const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const { data: rolesData } = await supabase
                .from('roles')
                .select('*')
                .eq('company_id', localStorage.getItem("company_id"))
            setRoles(rolesData || [])
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

    const handleEditRole = (role) => {
        setEditingRole(role)
        setEditRoleDialogOpen(true)
        setEditError("")
    }

    const handleUpdate = async () => {
        if (!editingRole.role_id) {
            setEditError("Role ID is required")
            return
        }

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

    const filteredRoles = roles
        .filter(role => role?.title.toLowerCase().includes(roleSearch.toLowerCase()))
        .sort((a, b) => a.title.localeCompare(b.title))

    return (
        <div className="space-y-4 w-full">
            <div className="flex gap-4 justify-between items-center">
                <div className="w-4/5">
                    <MagnifyingGlassIcon className="absolute mt-2 ml-2 text-white/25 h-5 w-5" />
                    <Input
                        className="pl-8 max-w-64"
                        placeholder="Search Roles"
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                    />
                </div>
                <Button className="max-w-48" onClick={() => setAddRoleDialogOpen(true)}>
                    <span className="hidden lg:block">Add Role</span>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {filteredRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-2 border border-white/25 rounded-lg hover:shadow-sm">
                        <Badge style={{ backgroundColor: role.color }}>
                            {role.title}
                        </Badge>
                        <div className="flex">
                            <button
                                className='p-2 text-white hover:text-white/50'
                                onClick={() => handleEditRole(role)}
                            >
                                <Pencil1Icon className='h-4 w-4' />
                            </button>
                            <button
                                className='p-2 text-white hover:text-error'
                                onClick={() => deleteRole(role.id)}
                            >
                                <TrashIcon className='h-4 w-4' />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {/* {filteredRoles.length > visibleRoles && (
                <Button className="" variant="ghost" onClick={() => setVisibleRoles(visibleRoles + 9)}>
                    Show more
                </Button>
            )} */}

            {/* Add Role Dialog */}
            <Dialog open={addRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Role</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-title">Role Name *</Label>
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
                        <Button variant="outline" onClick={() => setAddRoleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            addRole();
                            if (!roleError) setAddRoleDialogOpen(false);
                        }}>Add Role</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={editRoleDialogOpen} onOpenChange={setEditRoleDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role-title">Role Name *</Label>
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
                        <Button variant="outline" onClick={() => setEditRoleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}