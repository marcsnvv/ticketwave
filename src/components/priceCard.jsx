import { useRouter } from "next/navigation"


export default function PriceCard({ title, price, features, featured }) {
    const router = useRouter()

    return (
        <div className={`
            relative flex flex-col justify-end h-[585px]
            ${featured ? 'bg-secondary rounded-[12px]' : 'bg-transparent'}
        `}>
            {
                featured && (
                    <span className="absolute top-0 w-full p-2 uppercase font-semibold text-white text-center">
                        Most popular
                    </span>
                )
            }
            <div className={`
            flex flex-col items-center justify-start gap-4 bg-primary rounded-[12px] border p-[24px] w-[300px] h-[550px]
            ${featured ? 'border-secondary' : 'border-white/25'}
        `}>
                <span className='text-[24px] text-white font-semibold'>
                    {title}
                </span>
                <div className='flex items-center justify-center gap-2'>
                    <span className='text-[48px] text-white font-semibold'>
                        {price}
                    </span>
                    <span className='text-[16px] text-white/25'>
                        EUR<br />
                        <span className='font-semibold'>/month</span>
                    </span>
                </div>

                <button
                    onClick={() => router.push("/apply?plan=" + title)}
                    className={`
            bg-button-gradient w-full text-white rounded-[6px] p-[16px] font-semibold
            transition-all duration-300 hover:bg-button-hover-gradient
            ${featured ? 'border-2 border-secondary' : ''}    
            `}>
                    Get {title}
                </button>

                <div className='flex flex-col gap-2 mt-4'>
                    {features.map((feature, index) => {
                        return <div key={index} className='flex gap-2 items-center'>
                            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.3334 4.5L6.00008 11.8333L2.66675 8.5" stroke="#F0F0F0" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                            <span className='text-white/50'>
                                {feature}
                            </span>
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}