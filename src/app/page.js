"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase'; // Asegúrate de que la ruta sea correcta
import Link from 'next/link';
import Image from 'next/image';
import PriceCard from '@/components/priceCard';
import FaqCard from '@/components/faqCard';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkDiscordMembership = async (access_token) => {
    try {
      // Verificar membresía en el servidor
      const guildResponse = await fetch(`https://discord.com/api/users/@me/guilds/1252606608999977080/member`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (!guildResponse.ok) {
        console.log('User is not a member of the required server');
        return false;
      }

      const guildData = await guildResponse.json();
      console.log(guildData)

      // Verificar si tiene el rol específico
      if (!guildData.roles.includes("1316157670272532582")) {
        console.log('User does not have the required role');
        return false;
      }

      return true;
    } catch (error) {
      console.log('Error checking Discord membership:', error);
      return false;
    }
  }

  // Añadir este efecto para manejar el callback de Discord
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.provider_token) {
        const hasAccess = await checkDiscordMembership(session.provider_token);
        if (!hasAccess) {
          await supabase.auth.signOut();
        } else {
          // Recuperar el usuario de Supabase y insertar el company id en localStorage
          const { data: user, error } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', session.user.id)

          if (error) {
            console.log('Error fetching user:', error.message);
            return;
          }

          if (user.length === 0) {
            console.log('User not found');
            return;
          }

          localStorage.setItem('company_id', user[0].company_id);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsLoggedIn(true);
      }
    };

    checkSession();
  }, []);

  return (
    <>
      <Image
        src="/ilustration.png"
        width={800}
        height={800}
        alt="Background illustration"
        className="absolute -left-96 top-0 opacity-40 z-0"
      />
      <Image
        src="/ilustration.png"
        width={600}
        height={600}
        alt="Background illustration"
        className="absolute -right-64 top-96 opacity-30 z-0"
      />
      <Image
        src="/ilustration.png"
        width={900}
        height={900}
        alt="Background illustration"
        className="absolute -left-80 top-[120%] opacity-25 z-0"
      />
      <Image
        src="/ilustration.png"
        width={700}
        height={700}
        alt="Background illustration"
        className="absolute -right-72 top-[180%] opacity-35 z-0"
      />
      <Image
        src="/ilustration.png"
        width={800}
        height={800}
        alt="Background illustration"
        className="absolute -left-96 top-[250%] opacity-30 z-0"
      />
      <Image
        src="/ilustration.png"
        width={600}
        height={600}
        alt="Background illustration"
        className="absolute -right-64 top-[300%] opacity-25 z-0"
      />

      <Image
        src={"/monitors-preview.svg"}
        width={1222}
        height={678}
        alt="Monitors preview"
        className="absolute right-0 top-[40%] z-0 mask-gradient opacity-100"
      />
      <div className='w-screen flex justify-center h-full scroll-smooth'>
        <nav className='fixed w-[1440px] flex justify-between px-[24px] py-[24px] bg-background z-50'>
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

            {/* Navigation */}
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

          {/* Section 2 */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                router.push('/dashboard');
              } else {
                router.push('/login');
              }
            }}
            className="text-white font-semibold text-[16px] bg-button-gradient px-[16px] py-[8px] rounded-[36px] transition-all duration-300 hover:bg-button-hover-gradient"
          >
            {isLoggedIn ? "Dashboard" : "Sign in"}
          </button>
        </nav>

        {/* Hero */}
        <main id="home" className='flex flex-col justify-center items-center mt-36 max-w-[1440px] relative'>
          {/* Background illustrations */}


          <section className='flex flex-col justify-center items-center gap-8 h-screen'>
            <h1 className='font-swiss text-[96px] text-white mt-24 text-center z-10'>
              <span className='text-transparent bg-clip-text bg-h1-gradient'>BEAT</span> THE MARKET,
              MAXIMIZE <span className='text-transparent bg-clip-text bg-h1-gradient'>PROFITS</span>
            </h1>
            <span className='font-[24px] text-center text-white/50'>
              Get easy-to-use, super-fast and absolutely accurate<br />
              custom monitors tuned to perfection
            </span>
            <button className="text-white font-semibold text-[16px] bg-button-gradient px-[16px] py-[8px] rounded-[36px] transition-all duration-300 hover:bg-button-hover-gradient">
              Apply now
            </button>
            <Image
              src={"/tw-3d-logo.svg"}
              width={1392}
              height={697}
              alt="TicketWave 3d Logo"
              className='z-10'
            />


          </section>

          {/* Numbers section */}
          <section className='h-[169px] bg-background my-48'>
            <div className='flex items-center gap-8 px-[24px]'>
              <div className='flex flex-col items-center'>
                <span className='text-white text-[64px] font-semibold'>100+</span>
                <span className='text-white/25 text-sm font-semibold'>PROFITABLE EVENTS MONITORED</span>
              </div>
              {/* Divider */}
              <div className='w-0.5 bg-white/25 h-[80px]'></div>
              <div className='flex flex-col items-center'>
                <span className='text-white text-[64px] font-semibold'>1000+</span>
                <span className='text-white/25 text-sm font-semibold'>TICKETS CATCHED WEEKLY</span>
              </div>
              {/* Divider */}
              <div className='w-0.5 bg-white/25 h-[80px]'></div>
              <div className='flex flex-col items-center'>
                <span className='text-white text-[64px] font-semibold'>10,000€</span>
                <span className='text-white/25 text-sm font-semibold'>EUR PROFIT MADE WEEKLY</span>
              </div>
              {/* Divider */}
              <div className='w-0.5 bg-white/25 h-[80px]'></div>
              <div className='flex flex-col items-center'>
                <span className='text-white text-[64px] font-semibold'>99.9%</span>
                <span className='text-white/25 text-sm font-semibold'>ACCURACY</span>
              </div>
              {/* Divider */}
              <div className='w-0.5 bg-white/25 h-[80px]'></div>
              <div className='flex flex-col items-center'>
                <span className='text-white text-[64px] font-semibold'>0.5s</span>
                <span className='text-white/25 text-sm font-semibold'>PING AFTER STOCK LOADED</span>
              </div>
            </div>
          </section>

          {/* 2n SECTION */}
          <section id="features" className='flex flex-col justify-start items-start w-full gap-8 py-[24px]'>
            <h2 className='font-swiss text-[96px] text-white text-center w-full'>
              <span className='text-transparent bg-clip-text bg-h1-gradient'>ENOJIY</span> THE<br />
              <span className='text-transparent bg-clip-text bg-h1-gradient'>BENEFITS</span>
            </h2>
            <div className='flex justify-between w-full'>
              <div className='flex items-center justify-start gap-4'>
                <svg width="8" height="142" viewBox="0 0 8 142" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="4" cy="21" r="4" fill="#6DA5C0" />
                  <rect x="3.5" y="27" width="1" height="8" fill="#F0F0F0" fillOpacity="0.25" />
                  <circle cx="4" cy="41" r="4" fill="#F0F0F0" fillOpacity="0.25" />
                  <rect x="3.5" y="47" width="1" height="8" fill="#F0F0F0" fillOpacity="0.25" />
                  <circle cx="4" cy="61" r="4" fill="#F0F0F0" fillOpacity="0.25" />
                  <rect x="3.5" y="67" width="1" height="8" fill="#F0F0F0" fillOpacity="0.25" />
                  <circle cx="4" cy="81" r="4" fill="#F0F0F0" fillOpacity="0.25" />
                  <rect x="3.5" y="87" width="1" height="8" fill="#F0F0F0" fillOpacity="0.25" />
                  <circle cx="4" cy="101" r="4" fill="#F0F0F0" fillOpacity="0.25" />
                  <rect x="3.5" y="107" width="1" height="8" fill="#F0F0F0" fillOpacity="0.25" />
                  <circle cx="4" cy="121" r="4" fill="#F0F0F0" fillOpacity="0.25" />
                </svg>

                <div className='w-1/2 flex flex-col gap-4 items-start justify-start'>
                  <div className='flex gap-2'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_269_27)">
                        <path d="M9 12H9.01" stroke="#6DA5C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15 12H15.01" stroke="#6DA5C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 16C10.5 16.3 11.2 16.5 12 16.5C12.8 16.5 13.5 16.3 14 16" stroke="#6DA5C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6.3C19.906 7.43567 20.5236 8.77378 20.8 10.2C21.1381 10.3638 21.4233 10.6195 21.6229 10.9378C21.8224 11.2562 21.9282 11.6243 21.9282 12C21.9282 12.3757 21.8224 12.7438 21.6229 13.0622C21.4233 13.3805 21.1381 13.6362 20.8 13.8C20.3683 15.8135 19.2592 17.618 17.6577 18.9125C16.0562 20.207 14.0592 20.9132 12 20.9132C9.94076 20.9132 7.94379 20.207 6.34231 18.9125C4.74083 17.618 3.63171 15.8135 3.2 13.8C2.86186 13.6362 2.57668 13.3805 2.37714 13.0622C2.17761 12.7438 2.07178 12.3757 2.07178 12C2.07178 11.6243 2.17761 11.2562 2.37714 10.9378C2.57668 10.6195 2.86186 10.3638 3.2 10.2C3.61426 8.1705 4.71589 6.34602 6.31902 5.03437C7.92216 3.72271 9.92866 3.00418 12 3C14 3 15.5 4.1 15.5 5.5C15.5 6.9 14.6 8 13.5 8C12.7 8 12 7.6 12 7" stroke="#6DA5C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                      <defs>
                        <clipPath id="clip0_269_27">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>

                    <span className='text-[#6DA5C0] font-semibold font-[16px]'>
                      #easy-setup
                    </span>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <span className='text-[32px] text-white font-semibold'>
                      Easy set-up for everyone
                    </span>
                    <span className='text-[20px] text-white/50 text-wrap'>
                      Anyone con do it, group or individual, just a few clicks. We also supply the product with a video tutorial and are available to answer you requests.
                    </span>
                  </div>
                  <button className="flex gap-2 items-center justify-between text-white font-semibold group">
                    View Guide
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
                  </button>
                </div>
              </div>
              <div className='h-[600px] w-[900px] bg-white/10'>
              </div>
            </div>
          </section>

          {/* Dashboard Preview Section */}
          <section className='flex flex-col justify-center items-center w-full gap-8 py-[24px]'>
            <h2 className='font-swiss text-[96px] text-white text-center w-full'>
              CLEAR, SIMPLE,<br />
              <span className='text-transparent bg-clip-text bg-h1-gradient'>POWERFUL</span>
            </h2>
            <div className='bg-button-gradient p-[48px] rounded-[24px] flex flex-col items-center justify-center gap-6'>
              <span className='text-white text-[32px] font-semibold'>...everything you need</span>
              <button className="flex gap-2 items-center justify-between text-white font-semibold group">
                View Guide
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
              </button>

              <Image
                src={"/monitors-preview.svg"}
                width={1222}
                height={678}
                alt="Monitors preview image"
                className='rounded-[12px]'
              />
            </div>
          </section>

          {/* Pricing section */}
          <section id="pricing" className='flex flex-col justify-center items-center w-full gap-8 py-[24px]'>
            <h2 className='font-swiss text-[96px] text-white text-center w-full'>
              <span className='text-transparent bg-clip-text bg-h1-gradient'>CHOOSE</span> THE MOST<br />
              SUITABLE <span className='text-transparent bg-clip-text bg-h1-gradient'>PLAN</span>
            </h2>
            <div className='flex items-center justify-end gap-8'>
              <PriceCard
                title="BASIC"
                price="180"
                features={[
                  "Maximum 100 Events",
                  "Discord integration",
                  "Customizable notifications",
                  "Up to 5 people in the team",
                  "Our support will reply in 48h",
                ]}
              />
              <PriceCard
                title="STANDARD"
                price="340"
                features={[
                  "Maximum 200 Events",
                  "Discord integration",
                  "Customizable notifications",
                  "Up to 10 people in the team",
                  "24/7 support",
                  "Viagogo price errors",
                ]}
              />
              <PriceCard
                title="PRO"
                price="420"
                features={[
                  "Maximum 200 Events",
                  "Discord integration",
                  "Customizable notifications",
                  "Up to 10 people in the team",
                  "24/7 support",
                  "Viagogo price errors",
                  "2x TicketWave InnerCircle subscription",
                ]}
                featured
              />
              <PriceCard
                title="ENTERPRISE"
                price="495"
                features={[
                  "Maximum 200 Events",
                  "Discord integration",
                  "Customizable notifications",
                  "Up to 10 people in the team",
                  "24/7 support",
                  "Viagogo price errors",
                  "2x TicketWave InnerCircle subscription",
                  "API access",

                ]}
              />
            </div>
          </section>

          {/* FAQ section */}
          <section id="faq" className='flex flex-col justify-center items-center w-full gap-8 py-[24px]'>
            <h2 className='font-swiss text-[96px] text-white text-center w-full'>
              ANY <span className='text-transparent bg-clip-text bg-h1-gradient'>QUESTIONS?</span>
            </h2>
            <div className='flex flex-col gap-4'>
              <FaqCard
                title="What should be the starting capital for the ticket reselling business?"
                description={"What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business?"}
              />
              <FaqCard
                title="Who created these monitors?"
                description={"What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business?"}
              />
              <FaqCard
                title="How is it possible that you have all the monitors together?"
                description={"What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business?"}
              />
              <FaqCard
                title="Can I join your reselling group?"
                description={"What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business? What should be the starting capital for the ticket reselling business?"}
              />
            </div>

          </section>

          {/* Footer section */}
          <footer className='w-full h-[510px] flex justify-start gap-24 items-center p-[24px]'>
            <div className='flex gap-4 items-start justify-start'>
              <Link href="/">
                <Image
                  src={"/logo.svg"}
                  width={110}
                  height={110}
                  alt="TicketWave Logo"
                />
              </Link>
              <div className='flex flex-col gap-4'>
                <span className='text-[24px] text-white font-semibold'>
                  TicketWave<br />
                  Monitors
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className='w-0.5 h-24 bg-white/10' />

            <div className='flex justify-between gap-28'>
              <div className='flex flex-col gap-2'>
                <span className='text-white text-[20px] font-semibold'>
                  Quick Links
                </span>
                <Link href="/#">
                  <span className='text-white/50 text-[16px] hover:text-secondaryAccent duration-150'>
                    Home
                  </span>
                </Link>
                <Link href="/#features">
                  <span className='text-white/50 text-[16px] hover:text-secondaryAccent duration-150'>
                    Features
                  </span>
                </Link>
                <Link href="/#pricing">
                  <span className='text-white/50 text-[16px] hover:text-secondaryAccent duration-150'>
                    Pricing
                  </span>
                </Link>
              </div>

              <div className='flex flex-col gap-2'>
                <span className='text-white text-[20px] font-semibold'>
                  Legal
                </span>
                <Link href="/terms">
                  <span className='text-white/50 text-[16px] hover:text-secondaryAccent duration-150'>
                    Terms of Service
                  </span>
                </Link>
                <Link href="/privacy">
                  <span className='text-white/50 text-[16px] hover:text-secondaryAccent duration-150'>
                    Privacy Policy
                  </span>
                </Link>
              </div>

              <div className='flex flex-col gap-2'>
                <span className='text-white text-[20px] font-semibold'>
                  Support
                </span>
                <Link href="/terms">
                  <span className='text-white/50 text-[16px] hover:text-secondaryAccent duration-150'>
                    Email Us
                  </span>
                </Link>
                <Link href="/privacy">
                  <span className='text-white/50 text-[16px] hover:text-secondaryAccent duration-150'>
                    Discord
                  </span>
                </Link>
              </div>

              <div className='flex flex-col gap-2'>
                <span className='text-white text-[20px] font-semibold'>
                  Social
                </span>
                <Link href="/terms">
                  <span className='text-white/50 text-[16px] hover:text-secondaryAccent duration-150'>
                    Instagram
                  </span>
                </Link>
                <Link href="/privacy">
                  <span className='text-white/50 text-[16px] hover:text-secondaryAccent duration-150'>
                    X
                  </span>
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}