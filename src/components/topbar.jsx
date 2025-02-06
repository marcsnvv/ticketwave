import Link from "next/link";
import Image from "next/image";

export default function Topbar({ isLoggedIn, isMenuOpen, setIsMenuOpen, router }) {
    return (
        <>
            <nav className='fixed w-full flex items-center justify-center bg-background z-50'>
                <div className="lg:max-w-[1440px] w-full flex justify-between px-[24px] py-[24px]">
                    {/* Section 1 */}
                    <div className='flex gap-4'>
                        {/* Logo */}
                        <Link href={"/"} className='mr-4'>
                            <Image
                                src={"/logo.svg"}
                                width={45}
                                height={45}
                                alt="TicketWave Logo"
                            />
                        </Link>

                        {/* Navigation - Desktop */}
                        <div className='hidden md:hidden lg:flex gap-4'>
                            <Link href={"/#home"}>
                                <span className='font-semibold text-white font-[16px] hover:text-secondaryAccent duration-150'>Home</span>
                            </Link>
                            <Link href={"/#features"}>
                                <span className='font-semibold text-white font-[16px] hover:text-secondaryAccent duration-150'>Features</span>
                            </Link>
                            <Link href={"/#pricing"}>
                                <span className='font-semibold text-white font-[16px] hover:text-secondaryAccent duration-150'>Pricing</span>
                            </Link>
                            <Link href={"/#faq"}>
                                <span className='font-semibold text-white font-[16px] hover:text-secondaryAccent duration-150'>FAQ</span>
                            </Link>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <button
                        className='lg:hidden block'
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12H20" stroke="#F0F0F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 6H20" stroke="#F0F0F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 18H20" stroke="#F0F0F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            if (isLoggedIn) {
                                router.push('/dashboard');
                            } else {
                                router.push('/login');
                            }
                        }}
                        className="hidden lg:block text-white font-semibold text-[16px] bg-button-gradient px-[16px] py-[8px] rounded-[36px] transition-all duration-300 hover:bg-button-hover-gradient"
                    >
                        {isLoggedIn ? "Dashboard" : "Sign in"}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`block lg:hidden fixed top-[72px] left-0 w-full bg-background z-40 transform transition-transform duration-300 ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className='flex flex-col gap-4 p-6'>
                    <Link href={"/#home"} onClick={() => setIsMenuOpen(false)}>
                        <span className='font-semibold text-white font-[16px] hover:text-secondaryAccent duration-150'>Home</span>
                    </Link>
                    <Link href={"/#features"} onClick={() => setIsMenuOpen(false)}>
                        <span className='font-semibold text-white font-[16px] hover:text-secondaryAccent duration-150'>Features</span>
                    </Link>
                    <Link href={"/#pricing"} onClick={() => setIsMenuOpen(false)}>
                        <span className='font-semibold text-white font-[16px] hover:text-secondaryAccent duration-150'>Pricing</span>
                    </Link>
                    <Link href={"/#faq"} onClick={() => setIsMenuOpen(false)}>
                        <span className='font-semibold text-white font-[16px] hover:text-secondaryAccent duration-150'>FAQ</span>
                    </Link>
                    <button
                        onClick={() => {
                            if (isLoggedIn) {
                                router.push('/dashboard');
                            } else {
                                router.push('/login');
                            }
                        }}
                        className="text-white font-semibold text-[16px] bg-button-gradient px-[16px] py-[8px] rounded-[36px] transition-all duration-300 hover:bg-button-hover-gradient max-w-24"
                    >
                        {isLoggedIn ? "Dashboard" : "Sign in"}
                    </button>
                </div>
            </div>
        </>
    )
}