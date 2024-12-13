"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../../../../supabase'
import { useRouter } from 'next/navigation'
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"
import RevenueSection from './sections/revenue'
import ClientsSection from './sections/clients'
import LogsSection from './sections/logs'

const admins_emails = [process.env.ADMIN_EMAIL1, process.env.ADMIN_EMAIL2, "vuntagecom@gmail.com", "busines1244@gmail.com"]

export default function AdminPage() {
    const router = useRouter()
    const [activeSection, setActiveSection] = useState('revenue')

    useEffect(() => {
        async function checkAuth() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session || !admins_emails.includes(session.user.email)) {
                router.push("/login")
            }
        }
        checkAuth()
    }, [])

    const renderSection = () => {
        switch (activeSection) {
            case 'revenue':
                return <RevenueSection />
            case 'clients':
                return <ClientsSection />
            case 'logs':
                return <LogsSection />
            default:
                return <RevenueSection />
        }
    }

    return (
        <div className="flex flex-col h-screen">
            <main className='flex-1 overflow-auto p-5 lg:mx-48'>
                <Menubar className="flex w-56 mb-4">
                    <MenubarMenu>
                        <MenubarTrigger
                            className={activeSection === 'revenue' ? 'bg-secondary' : ''}
                            onClick={() => setActiveSection('revenue')}
                        >
                            Revenue
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger
                            className={activeSection === 'clients' ? 'bg-secondary' : ''}
                            onClick={() => setActiveSection('clients')}
                        >
                            Clients
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger
                            className={activeSection === 'logs' ? 'bg-secondary' : ''}
                            onClick={() => setActiveSection('logs')}
                        >
                            Logs
                        </MenubarTrigger>
                    </MenubarMenu>
                </Menubar>
                {renderSection()}
            </main>
        </div>
    )
}
