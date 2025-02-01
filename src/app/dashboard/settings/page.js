"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../supabase'
import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'

export default function SettingsPage() {
    const router = useRouter()

    useEffect(() => {
        async function checkAuth() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login")
            }
        }
        checkAuth()
    }, [])

    return (
        <div className="flex flex-col h-screen">
            <main className='flex-1 overflow-auto p-5 lg:mx-48'>
                <Menubar className="flex w-72 mb-4">
                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/dashboard/settings/channels')}
                        >
                            Channels
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/dashboard/settings/roles')}
                        >
                            Roles
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/dashboard/settings/customization')}
                        >
                            Customization
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

