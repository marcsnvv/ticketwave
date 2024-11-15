"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import Image from 'next/image'
import Link from 'next/link'
import { ListBulletIcon, MixerHorizontalIcon, ExitIcon } from "@radix-ui/react-icons"

export default function Navbar() {
    const router = useRouter()

    return (
        <div className="flex items-center justify-between p-5 text-white mx-48">
            <div className="flex items-center">
                <Link href={"/"}>
                    <Image src="/logo.png" alt="Logo" width={35} height={35} />
                </Link>
            </div>
            <div className="flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="h-8 w-8 cursor-pointer">
                            <AvatarImage alt="User Avatar" />
                            <AvatarFallback>TW</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel
                        >
                            TicketWave
                        </DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => router.push("/dashboard")} >
                            <ListBulletIcon className="w-4 h-4 mr-2" />
                            Monitors
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => router.push("/dashboard/settings")}>
                            <MixerHorizontalIcon className="w-4 h-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
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
