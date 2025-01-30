"use client"

import { useState, useEffect } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import Image from 'next/image'
import Link from 'next/link'
import { ListBulletIcon, MixerHorizontalIcon, ExitIcon, RocketIcon } from "@radix-ui/react-icons"
import { Building2 } from "lucide-react"

const admins_emails = [process.env.ADMIN_EMAIL1, process.env.ADMIN_EMAIL2, "vuntagecom@gmail.com", "busines1244@gmail.com"]

// Add these imports at the top
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [companies, setCompanies] = useState([])
    const [isSwitchOpen, setIsSwitchOpen] = useState(false)

    function logout(event) {
        event.preventDefault()
        supabase.auth.signOut()
        router.push("/login")
    }

    const handleSwitchCompany = async (newCompanyId) => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            // Get current user data
            const { data: userData } = await supabase
                .from('users')
                .select('company_id')
                .eq('email', authUser.email)
                .single()

            if (userData?.company_id) {
                // Add current company_id to companies_access if not exists
                const { data: existingAccess } = await supabase
                    .from('companies_access')
                    .select('*')
                    .match({
                        user_id: user.id,
                        company_id: userData.company_id
                    })

                if (!existingAccess?.length) {
                    await supabase
                        .from('companies_access')
                        .insert([{
                            user_id: user.id,
                            company_id: userData.company_id
                        }])
                }
            }

            // Update user's company_id
            const { data: userDataUpdated, error: updateError } = await supabase
                .from('users')
                .update({ company_id: newCompanyId })
                .eq('email', authUser.email)

            if (updateError) throw updateError

            setIsSwitchOpen(false)
            window.location.reload() // Reload to update the UI
        } catch (error) {
            console.error('Error switching company:', error)
        }
    }

    useEffect(() => {
        async function fetchData() {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) {
                router.push("/login")
            } else {
                if (admins_emails.includes(authUser.email)) {
                    setIsAdmin(true)
                }

                const { data, error } = await supabase
                    .from('users')
                    .select('name,email,avatar_url')
                    .eq('email', authUser.email)

                if (error) {
                    console.log(error)
                }

                if (data) {
                    console.log(data[0])
                    setUser(data[0])
                }
            }

        }

        fetchData()
    }, [])

    useEffect(() => {
        async function fetchData() {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) {
                router.push("/login")
            } else {
                if (admins_emails.includes(authUser.email)) {
                    setIsAdmin(true)
                }
                // En el segundo useEffect, modifica la consulta para incluir el nombre de la compañía actual
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('id,name,email,avatar_url,company_id,companies(name),companies_access(company_id,companies(name))')
                    .eq('email', authUser.email)
                    .single()
                    .single()
                if (error) {
                    console.log(error)
                }
                if (userData) {
                    console.log(userData)
                    setUser(userData)
                    // Format companies data
                    const accessibleCompanies = userData.companies_access?.map(access => ({
                        id: access.company_id,
                        name: access.companies?.name
                    })) || []
                    setCompanies(accessibleCompanies)
                }
            }
        }

        fetchData()
    }, [])

    return (
        <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-black/30">
            <div className="flex items-center justify-between p-5 text-white lg:mx-48">
                <div className="flex items-center">
                    <Link href={"/"}>
                        <Image src="/logo.png" alt="Logo" width={35} height={35} />
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="h-8 w-8 cursor-pointer">
                                <AvatarImage src={user?.avatar_url} alt={user?.name} />
                                <AvatarFallback>{user?.name?.substring(0, 2)?.toUpperCase() || 'TW'}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="flex flex-col gap-1">
                                <div>{user?.name || 'TicketWave'}</div>
                                <div className="text-sm text-gray-500">
                                    {user?.companies?.name || 'No company selected'}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => router.push("/dashboard")} >
                                <ListBulletIcon className="w-4 h-4 mr-2" />
                                Monitors
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => router.push("/dashboard/settings")}>
                                <MixerHorizontalIcon className="w-4 h-4 mr-2" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setIsSwitchOpen(true)}>
                                <Building2 className="w-4 h-4 mr-2" />
                                Company
                            </DropdownMenuItem>
                            {
                                isAdmin
                                    ? <DropdownMenuItem onSelect={() => router.push("/dashboard/admin")}>
                                        <RocketIcon className="w-4 h-4 mr-2" />
                                        Admin
                                    </DropdownMenuItem>
                                    : null
                            }
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={(e) => logout(e)}>
                                <ExitIcon className="w-4 h-4 mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Dialog open={isSwitchOpen} onOpenChange={setIsSwitchOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Company</DialogTitle>
                    </DialogHeader>
                    {/* Info about the company */}

                    <div className="flex flex-col gap-1">
                        <div className="text-xl">
                            {user?.companies?.name || 'No company selected'}
                        </div>
                    </div>

                    <h3 className="mt-4 text-sm font-medium text-gray-500">
                        Switch company
                    </h3>

                    <div className="grid grid-cols-1 gap-2">
                        {companies.map((company) => (
                            <Button
                                key={company.id}
                                variant="outline"
                                className="justify-start"
                                onClick={() => handleSwitchCompany(company.id)}
                            >
                                <Building2 className="w-4 h-4 mr-2" />
                                {company.name}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
