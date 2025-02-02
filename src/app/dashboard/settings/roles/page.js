"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../../supabase'
import { RolesSection } from '../components/roles-section'

export default function RolesPage() {
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
            <h2 className='text-5xl font-semibold text-white mb-4'>Roles</h2>
            <RolesSection />
        </main>
    )
}