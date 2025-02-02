"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabase';
import { fetchUserData } from '../../utils/fetchUserData'; // Import the utility function
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
import Link from 'next/link'
import { ListBulletIcon, MixerHorizontalIcon, ExitIcon, RocketIcon, PersonIcon } from "@radix-ui/react-icons"
import { Building2 } from "lucide-react"
import { usePathname } from 'next/navigation'  // Add this import at the top

const admins_emails = [process.env.ADMIN_EMAIL1, process.env.ADMIN_EMAIL2, "vuntagecom@gmail.com", "busines1244@gmail.com"]

// Add these imports at the top
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from './card'

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [isSwitchOpen, setIsSwitchOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('');
    const pathname = usePathname();

    useEffect(() => {
        setCurrentPage(pathname);
        console.log(pathname)
    }, [pathname]);

    useEffect(() => {
        async function fetchData() {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                router.push("/login");
            } else {
                if (admins_emails.includes(authUser.email)) {
                    setIsAdmin(true);
                }

                const userData = await fetchUserData(authUser.email); // Use the utility function

                if (userData) {
                    // Format companies data
                    const accessibleCompanies = userData.companies_access?.map(access => ({
                        id: access.company_id,
                        name: access.companies?.name,
                        image_url: access.companies?.notification_settings?.[0]?.image_url,
                        color: access.companies?.notification_settings?.[0]?.color
                    })) || [];
                    setCompanies(accessibleCompanies);
                    setUser(userData);
                }
            }
        }

        fetchData();
    }, []);

    function logout(event) {
        event.preventDefault()
        supabase.auth.signOut()
        router.push("/login")
    }

    const handleSwitchCompany = async (newCompanyId) => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            // Get current user data
            const { data: userData } = await supabase
                .from('users')
                .select('company_id')
                .eq('email', authUser.email)
                .single()

            if (userData?.company_id) {
                // Add current company_id to companies_access if not exists
                const { data: existingAccess } = await supabase
                    .from('companies_access')
                    .select('*')
                    .match({
                        user_id: user.id,
                        company_id: userData.company_id
                    })

                if (!existingAccess?.length) {
                    await supabase
                        .from('companies_access')
                        .insert([{
                            user_id: user.id,
                            company_id: userData.company_id
                        }])
                }
            }

            // Update user's company_id
            const { data: userDataUpdated, error: updateError } = await supabase
                .from('users')
                .update({ company_id: newCompanyId })
                .eq('email', authUser.email)

            if (updateError) throw updateError

            setIsSwitchOpen(false)
            window.location.reload() // Reload to update the UI

        } catch (error) {
            console.error('Error switching company:', error)
        }
    }

    return (
        <div className="fixed w-[250px] h-screen bg-primary">
            <div className="flex flex-col items-start justify-between p-[24px] text-white h-screen border-r border-white/25">

                <div className='flex flex-col items-center gap-2 w-full'>
                    <Link href={"/"}>
                        <Image src="/logo.png" alt="Logo" width={200} height={200} />
                    </Link>
                    <hr className='w-full border border-white/25' />
                    <div className="flex flex-col items-start gap-2 w-full overflow-auto max-h-64">
                        <button
                            className={`
                                flex justify-start items-center gap-2 hover:bg-white/25 p-2 px-3 w-full rounded-md transition duration-200 ease-in-out
                                ${currentPage === "/dashboard" ? "bg-white/25" : ""}
                            `}
                            onClick={() => router.push("/dashboard")}
                        >
                            <ListBulletIcon className="w-6 h-6" />
                            Monitors
                        </button>
                        <div className="relative w-full">
                            <button
                                className={`
                                    flex justify-start items-center gap-2 hover:bg-white/25 p-2 px-3 w-full rounded-md transition duration-200 ease-in-out
                                    ${currentPage === "/settings" ? "bg-white/25" : ""}
                                `}
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            >
                                <MixerHorizontalIcon className="w-6 h-6" />
                                Settings
                            </button>
                            {isSettingsOpen && (
                                <div className="flex">
                                    <div className='relative flex flex-col items-center jsutify-between h-full w-full mt-2 ml-6'>
                                        <button
                                            className={`
                                                ${currentPage === "/dashboard/settings/channels" ? "border-seoncdaryAccent" : "border-white/25"}
                                                border-l flex justify-start items-center gap-2 hover:text-white/75 p-2 px-3 w-full transition duration-200 ease-in-out    
                                            `}
                                            onClick={() => router.push("/dashboard/settings/channels")}
                                        >
                                            Channels
                                        </button>
                                        <button
                                            className={`
                                                ${currentPage === "/dashboard/settings/roles" ? "border-seoncdaryAccent" : "border-white/25"}
                                                border-l flex justify-start items-center gap-2 hover:text-white/75 p-2 px-3 w-full transition duration-200 ease-in-out    
                                            `}
                                            onClick={() => router.push("/dashboard/settings/roles")}
                                        >
                                            Roles
                                        </button>
                                        <button
                                            className={`
                                                ${currentPage === "/dashboard/settings/customization" ? "border-seoncdaryAccent" : "border-white/25"}
                                                border-l flex justify-start items-center gap-2 hover:text-white/75 p-2 px-3 w-full transition duration-200 ease-in-out    
                                            `}
                                            onClick={() => router.push("/dashboard/settings/customization")}
                                        >
                                            Customization
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            className={`
                                flex justify-start items-center gap-2 hover:bg-white/25 p-2 px-3 w-full rounded-md transition duration-200 ease-in-out
                                ${currentPage === "/company" ? "bg-white/25" : ""}
                            `}
                            onClick={() => setIsSwitchOpen(true)}
                        >
                            <Building2 className="w-6 h-6" />
                            Company
                        </button>


                    </div>
                    {
                        isAdmin
                            ? (
                                <div className='flex flex-col items-start gap-2 w-full max-h-36'>
                                    <div className='flex gap-2 items-center justify-between w-full'>
                                        <hr className='w-full border border-white/25' />
                                        <span className='text-sm font-bold text-white/25'>ADMIN</span>
                                        <hr className='w-full border border-white/25' />
                                    </div>
                                    <button
                                        className={`
                                            flex justify-start items-center gap-2 hover:bg-white/25 p-2 px-3 w-full rounded-md transition duration-200 ease-in-out
                                            ${currentPage === "/dashboard/admin/revenue" ? "bg-white/25" : ""}
                                        `}
                                        onClick={() => router.push("/dashboard/admin/revenue")}
                                    >
                                        <RocketIcon className="w-6 h-6" />
                                        Revenue
                                    </button>
                                    <button
                                        className={`
                                            flex justify-start items-center gap-2 hover:bg-white/25 p-2 px-3 w-full rounded-md transition duration-200 ease-in-out
                                            ${currentPage === "/dashboard/admin/clients" ? "bg-white/25" : ""}
                                        `}
                                        onClick={() => router.push("/dashboard/admin/clients")}
                                    >
                                        <PersonIcon className="w-6 h-6" />
                                        Clients
                                    </button>
                                    <button
                                        className={`
                                            flex justify-start items-center gap-2 hover:bg-white/25 p-2 px-3 w-full rounded-md transition duration-200 ease-in-out
                                            ${currentPage === "/dashboard/admin/logs" ? "bg-white/25" : ""}
                                        `}
                                        onClick={() => router.push("/dashboard/admin/logs")}
                                    >
                                        <ListBulletIcon className="w-6 h-6" />
                                        Logs
                                    </button>
                                </div>
                            )
                            : null
                    }


                </div>


                <div className='flex flex-col gap-4 w-full'>
                    <div className='flex gap-4'>

                        <Avatar className="h-12 w-12 cursor-pointer">
                            <AvatarImage src={user?.avatar_url} alt={user?.name} />
                            <AvatarFallback>{user?.name?.substring(0, 2)?.toUpperCase() || 'TW'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div>{user?.name || 'TicketWave'}</div>
                            <div className="text-sm text-gray-400">
                                {user?.companies?.name || 'No company selected'}
                            </div>
                        </div>
                    </div>
                    <hr className='w-full border border-white/25' />
                    <Button
                        className="bg-white w-full text-black hover:bg-white/25"
                        onClick={(e) => logout(e)}>
                        <ExitIcon className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>



            </div >

            <Dialog open={isSwitchOpen} onOpenChange={setIsSwitchOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Company</DialogTitle>
                    </DialogHeader>
                    {/* Info about the company */}

                    <div className="flex flex-col gap-1">
                        <div className="text-xl">
                            {user?.companies?.name || 'No company selected'}
                        </div>
                    </div>

                    <h3 className="mt-4 text-sm font-medium text-gray-500">
                        Switch company
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                        {companies.map((company) => (
                            <Card
                                key={company.id}
                                className={`min-w-48 w-auto min-h-48 h-auto relative rounded-lg cursor-pointer border-white/25 hover:border-white/50`}

                                onClick={() => handleSwitchCompany(company.id)}
                            >
                                <div
                                    className='w-full h-24 rounded-t-lg'
                                    style={{
                                        backgroundColor: company.color,
                                    }}
                                >

                                </div>
                                <img
                                    src={company.image_url}
                                    alt={company.name}
                                    className="absolute top-14 w-24 h-24 rounded-full object-cover"
                                />
                                <span className='ml-28 mt-4 text-lg'>
                                    {company.name}
                                </span>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    )
}

