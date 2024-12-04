"use client"

import { useState, useEffect } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import Image from 'next/image'
import Link from 'next/link'
import { ListBulletIcon, MixerHorizontalIcon, ExitIcon } from "@radix-ui/react-icons"

export default function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState(null)

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/login")
            }

            console.log(user)

            const { data, error } = await supabase
                .from('users')
                .select('name,email,avatar_url')
                .eq('id', user.id)

            console.log(data)

            if (error) {
                console.log(error)
            }

            setUser(data?.[0])
        }

        fetchData()
    }, [])


    return (
        <div className="flex items-center justify-between p-5 text-white lg:mx-48">
            <div className="flex items-center">
                <Link href={"/"}>
                    <Image src="/logo.png" alt="Logo" width={35} height={35} />
                </Link>
            </div>
            <div className="flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="h-8 w-8 cursor-pointer">
                            <AvatarImage src={user?.avatar_url} alt={user?.name} />
                            <AvatarFallback>{user?.name?.substring(0, 2)?.toUpperCase() || 'TW'}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            {user?.name || 'TicketWave'}
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => supabase.auth.signOut()}>
                            <ExitIcon className="w-4 h-4 mr-2" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
