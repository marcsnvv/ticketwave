"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { useSearchParams } from 'next/navigation'
import { Building2, AtSign, Send } from "lucide-react"
import { DiscordLogoIcon } from "@radix-ui/react-icons"

import pricing from '@/data/pricing.json'

export default function ApplyPage() {
    const searchParams = useSearchParams("plan")
    const planParam = searchParams.get("plan")

    const [plan, setPlan] = useState({})
    const [formData, setFormData] = useState({
        discordUsername: '',
        companyName: '',
        socialMedia: '',
        referer: '1'
    })
    const [submited, setSubmitted] = useState(false)

    useEffect(() => {
        if (planParam) {
            // Encuentra el plan en la lista de params usando el "title"
            const p = pricing.find((item) => item.title === planParam) || {}
            setPlan(p)
        }
    }, [planParam])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL

        const embedData = {
            embeds: [{
                title: "New Application Received! 🎉",
                color: 0x0F969C,
                fields: [
                    {
                        name: "Discord Username",
                        value: formData.discordUsername,
                        inline: true
                    },
                    {
                        name: "Company Name",
                        value: formData.companyName,
                        inline: true
                    },
                    {
                        name: "Social Media",
                        value: formData.socialMedia,
                        inline: false
                    },
                    {
                        name: "Referer",
                        value: ["Twitter (X)", "Instagram", "Whop", "Google", "Other"][parseInt(formData.referer) - 1],
                        inline: true
                    },
                    {
                        name: "Selected Plan",
                        value: plan.title,
                        inline: true
                    },
                    {
                        name: "Price",
                        value: `${plan.price} EUR/month`,
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString()
            }]
        }

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(embedData)
            })

            if (response.ok) {
                setSubmitted(true)
            } else {
                throw new Error('Failed to send application')
            }
        } catch (error) {
            console.error('Error sending application:', error)
            alert('Error sending application. Please try again.')
        }
    }

    return (
        <div className="w-full text-white">
            <button
                onClick={() => {
                    window.location.href = "/"
                }}
                className="absolute top-10 left-10 flex items-center gap-4 text-white"
            >
                <div className="rotate-180">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transform transition-transform duration-300 group-hover:translate-x-2"
                    >
                        <path d="M5 12H19" stroke="#F0F0F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 5L19 12L12 19" stroke="#F0F0F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <span className="font-semibold">Go Home</span>
            </button>

            {plan ? (
                submited ? (
                    <div className='w-full h-screen flex items-center justify-center'>
                        <div className='flex flex-col gap-2 items-center justify-center'>
                            <span>Thank you for your application {formData.discordUsername.replace("@","")}!</span>
                            <span className='font-bold'>We will contact you soon.</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-[1440px] h-full grid grid-cols-3 gap-4 p-24">
                        <div className="col-span-2 flex flex-col gap-4">
                            <div className="border border-white/25 rounded-[12px] bg-pricary p-8 flex flex-col gap-4 bg-gradient">
                                <span className="font-swiss text-xl">Information</span>
                                <span>
                                    Thank you for your interest in TicketWave, please fill out this form with the necessary information.

                                    Once you have filled out the form, we will add you to a waiting list where you can ask us questions and resolve your doubts before we start.
                                </span>
                            </div>

                            <div className="border border-white/25 rounded-[12px] bg-pricary p-8 flex flex-col gap-4">
                                <div className="flex items-center justify-start gap-4">
                                    <DiscordLogoIcon className="w-6 h-6" />
                                    <span className="font-swiss text-xl">Discord Username *</span>
                                </div>
                                <span className="text-white/50 text-sm text-pretty">We will use your username to identify you in the application process.</span>
                                <input
                                    name="discordUsername"
                                    className="border border-white/25 rounded-[12px] bg-pricary py-2 px-4 bg-background focus:outline-none focus:ring-0"
                                    type="text"
                                    placeholder="@ticketwave"
                                    onChange={handleInputChange}
                                    value={formData.discordUsername}
                                />
                            </div>
                            <div className="border border-white/25 rounded-[12px] bg-pricary p-8 flex flex-col gap-4">
                                <div className="flex items-center justify-start gap-4">
                                    <Building2 className="w-8" />
                                    <span className="font-swiss text-xl">Company Name *</span>
                                </div>
                                <span className="text-white/50 text-sm text-pretty">Name of the company, group or community where you will use the monitors, if you do not have one, you can use your name</span>
                                <input
                                    name='companyName'
                                    className="border border-white/25 rounded-[12px] bg-pricary py-2 px-4 bg-background focus:outline-none focus:ring-0"
                                    type="text"
                                    placeholder="TicketWave"
                                    onChange={handleInputChange}
                                    value={formData.companyName}
                                />
                            </div>
                            <div className="border border-white/25 rounded-[12px] bg-pricary p-8 flex flex-col gap-4">
                                <div className="flex items-center justify-start gap-4">
                                    <AtSign className="w-8" />
                                    <span className="font-swiss text-xl">Social Media *</span>
                                </div>
                                <span className="text-white/50 text-sm text-pretty">The link of one of your social networks, it can be Twitter (X), Instagram, Whop, etc.</span>
                                <input
                                    name='socialMedia'
                                    className="border border-white/25 rounded-[12px] bg-pricary py-2 px-4 bg-background focus:outline-none focus:ring-0"
                                    type="text"
                                    placeholder="https://instagram.com/ticketwave"
                                    onChange={handleInputChange}
                                    value={formData.socialMedia}
                                />
                            </div>
                            <div className="border border-white/25 rounded-[12px] bg-pricary p-8 flex flex-col gap-4">
                                <div className="flex items-center justify-start gap-4">
                                    <Send className="w-8" />
                                    <span className="font-swiss text-xl">Referer *</span>
                                </div>
                                <span className="text-white/50 text-sm text-pretty">Where did you hear about us?</span>
                                <select
                                    name='referer'
                                    className="border border-white/25 rounded-[12px] bg-pricary py-2 px-4 bg-background focus:outline-none focus:ring-0"
                                    type="text"
                                    onChange={handleInputChange}
                                    value={formData.referer}
                                >
                                    <option value="1">Twitter (X)</option>
                                    <option value="2">Instagram</option>
                                    <option value="3">Whop</option>
                                    <option value="4">Google</option>
                                    <option value="5">Other</option>
                                </select>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="flex items-center justify-center border border-secondaryAccent rounded-[12px] bg-pricary p-4 flex flex-col gap-4 bg-button-gradient hover:bg-button-hover-gradient"
                            >
                                <span className="font-bold text-xl">Send</span>
                            </button>



                        </div>

                        <div className="border border-secondaryAccent rounded-[12px] bg-pricary p-8 flex flex-col gap-1 font-bold bg-button-gradient">
                            <span className="font-swiss text-xl mb-4">STANDARD package</span>
                            <span>Features:</span>
                            {
                                plan?.features?.map((feature, index) => (
                                    <span key={index}>- {feature}</span>
                                ))
                            }
                            <br />

                            <span>Monitors:</span>

                            <span>- AXS UK</span>
                            <span>- AXS NU</span>

                            <span>- Eventim DE</span>
                            <span>- Oeticket</span>
                            <span>- Ticketcorner CH</span>
                            <span>- Ticketone IT</span>

                            <span>- Seetickets UK</span>
                            <span>- Seetickets EU</span>

                            <span>- Ticketportal CZ</span>


                            <span>- TicketMaster AE</span>
                            <span>- TicketMaster AT</span>
                            <span>- TicketMaster BE</span>
                            <span>- TicketMaster CH</span>
                            <span>- TicketMaster CZ</span>
                            <span>- TicketMaster DE</span>
                            <span>- TicketMaster ES</span>
                            <span>- TicketMaster FR</span>
                            <span>- TicketMaster IT</span>
                            <span>- TicketMaster NL</span>
                            <span>- TicketMaster NO</span>
                            <span>- TicketMaster PL</span>
                            <span>- TicketMaster SE</span>
                            <span>- TicketMaster US</span>

                            <span>- Viagogo Errors</span>

                            <br />
                            <span>Pricing:</span>
                            <span>{plan.price} EUR/month</span>
                        </div>

                    </div>
                )
            ) : (
                <div className='w-full h-screen flex items-center justify-center'>
                    <div className='flex flex-col gap-2 items-center justify-center'>
                        <span>Select a plan to apply</span>
                        <Link className='text-white font-bold' href="/apply?plan=standard">Start with Standard</Link>
                    </div>
                </div>
            )}
        </div>
    )
}