"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import Image from 'next/image'
import Link from 'next/link'

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
                        <DropdownMenuItem onSelect={() => router.push("/dashboard")} >Monitors</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => router.push("/dashboard/settings")}>Settings</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => supabase.auth.signOut()}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
