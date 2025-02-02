"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../../supabase'
import { ChannelsSection } from '../components/channels-section'

export default function ChannelsPage() {
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
        <main className='flex flex-col items-start justify-start w-full p-[24px] min-h-screen h-full'>
            <h2 className='text-5xl font-semibold text-white mb-4'>Channels</h2>
            <ChannelsSection />
        </main>
    )
}