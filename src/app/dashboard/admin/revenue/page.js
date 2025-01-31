"use client"

import { useEffect } from 'react'
import { supabase } from '../../../../../supabase'
import { useRouter } from 'next/navigation'
import RevenueSection from '../sections/revenue'

const admins_emails = [process.env.ADMIN_EMAIL1, process.env.ADMIN_EMAIL2, "vuntagecom@gmail.com", "busines1244@gmail.com"]

export default function RevenueDashboard() {
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
                <RevenueSection />
            </main>
        </div>
    )
}