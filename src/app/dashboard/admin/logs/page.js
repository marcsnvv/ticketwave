"use client"

import { useEffect } from 'react'
import { supabase } from '../../../../../supabase'
import { useRouter } from 'next/navigation'
import LogsSection from '../sections/logs'

const admins_emails = [process.env.ADMIN_EMAIL1, process.env.ADMIN_EMAIL2, "vuntagecom@gmail.com", "busines1244@gmail.com", "michalkulik.k12@gmail.com"]

export default function LogsDashboard() {
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
        <main className='flex flex-col items-start justify-start w-full p-[24px] pt-[80px] min-h-screen h-full'>
            <h2 className='text-5xl font-semibold text-white mb-4'>Logs</h2>
            <LogsSection />
        </main>
    )
}