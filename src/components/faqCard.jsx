"use client"

import { useState } from "react"


export default function FaqCard({ title, description }) {
    const [showDescription, setShowDescription] = useState(false)

    // Haz una card que al hacer click encima, se despligue la respuesta (description)
    return (
        <div className="w-[800px] border border-white/25 hover:border-white/50 transition-all duration-150 rounded-[12px] p-[16px] flex flex-col gap-4">
            <button
                onClick={() => setShowDescription(!showDescription)}
                className='text-[16px] text-white flex items-center justify-between w-full'
            >
                {title}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="#F0F0F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 5V19" stroke="#F0F0F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {showDescription && (
                <span className='text-[16px] text-white font-semibold'>
                    {description}
                </span>
            )}
        </div>
    )

}