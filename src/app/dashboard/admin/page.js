"use client"

import { useEffect } from 'react'
import { supabase } from '../../../../supabase'
import { useRouter } from 'next/navigation'
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"

const admins_emails = [process.env.ADMIN_EMAIL1, process.env.ADMIN_EMAIL2, "vuntagecom@gmail.com", "busines1244@gmail.com"]

export default function AdminPage() {
    const router = useRouter()

    useEffect(() => {
        async function checkAuth() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session || !admins_emails.includes(session.user.email)) {
                router.push("/login")
            }
        }
        checkAuth()
    }, [])

    return (
        <div className="flex flex-col h-screen">
            <main className='flex-1 overflow-auto p-5 lg:mx-48'>
                <Menubar className="flex w-56 mb-4">
                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/dashboard/admin/revenuedashboard')}
                        >
                            Revenue
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/dashboard/admin/clientsdashboard')}
                        >
                            Clients
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/dashboard/admin/logsdashboard')}
                        >
                            Logs
                        </MenubarTrigger>
                    </MenubarMenu>
                </Menubar>
                <div className="text-center mt-10 text-gray-500">
                    Select a section from the menu above
                </div>
            </main>
        </div>
    )
}
