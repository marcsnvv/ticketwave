"use client"

import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase'; // Asegúrate de que la ruta sea correcta
import Link from 'next/link';
import Image from 'next/image';
import PriceCard from '@/components/priceCard';
import FaqCard from '@/components/faqCard';
import Topbar from '@/components/topbar';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  // Add currentFeature state
  const [currentFeature, setCurrentFeature] = useState(0);
  const imageContainer = useRef(null);

  // Modificar el efecto de scroll
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: imageContainer.current,
      pin: true,
      start: "top-=100px",
      end: document.body.offsetHeight - window.innerHeight - 50,
    })
  }, [])

  const stats = [
    { number: "100+", text: "PROFITABLE EVENTS MONITORED" },
    { number: "1000+", text: "TICKETS CATCHED WEEKLY" },
    { number: "10,000€", text: "EUR PROFIT MADE WEEKLY" },
    { number: "99.9%", text: "ACCURACY" },
    { number: "0.5s", text: "PING AFTER STOCK LOADED" }
  ];

  const features = [
    {
      "title": "Easy set-up for everyone",
      "hashtag": "#easy-setup",
      "description": "Anyone con do it, group or individual, just a few clicks. We also supply the product with a video tutorial and are available to answer you requests.",
      "image": "out-of-box.svg"
    },
    {
      "title": "Fastest on the market",
      "hashtag": "#speed",
      "description": "Compared to the competition, our pings are much earlier and more accurate. We minimize the human factor and automate most of the process.",
      "image": "stopwatch.svg"
    },
    {
      "title": "Works with every platform",
      "hashtag": "#platform",
      "description": "With us, you don’t need another tool because we have a reach across all platforms in the world.",
      "image": "network.svg"
    },
    {
      "title": "One-click carting",
      "hashtag": "#carting",
      "description": "Ping also comes with a link directly with the full cart, you just need to complete the order. This gives you plenty of time to analyze whether the purchase is really worth it.",
      "image": "cart.svg"
    },
    {
      "title": "Customized notifications",
      "hashtag": "#notifications",
      "description": "The tool works perfectly with Discord, you can set up notifications for specific events you want to be the first to know about.",
      "image": "bell.svg"
    },
    {
      "title": "We keep delivering...",
      "hashtag": "#delivering",
      "description": "TicketWave is a market leader in reselling, we are responsive to change and know what is essential for success in this business.",
      "image": "truck.svg"
    },
  ]

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
      {/* Background illustrations - Ajustadas para móvil */}
      <Image
        src="/ilustration.png"
        width={800}
        height={800}
        alt="Background illustration"
        className="absolute max-w-full max-h-full left-0 top-0 opacity-40 z-0 hidden lg:block"
      />
      <Image
        src="/ilustration.png"
        width={600}
        height={600}
        alt="Background illustration"
        className="absolute max-w-full max-h-full right-0 top-96 opacity-30 z-0 hidden lg:block"
      />
      <Image
        src="/ilustration.png"
        width={900}
        height={900}
        alt="Background illustration"
        className="absolute max-w-full max-h-full left-0 top-[120%] opacity-25 z-0 hidden lg:block"
      />
      <Image
        src="/ilustration.png"
        width={700}
        height={700}
        alt="Background illustration"
        className="absolute max-w-full max-h-full right-0 top-[180%] opacity-35 z-0 hidden lg:block"
      />
      <Image
        src="/ilustration.png"
        width={800}
        height={800}
        alt="Background illustration"
        className="absolute max-w-full max-h-full left-0 top-[250%] opacity-30 z-0 hidden lg:block"
      />
      <Image
        src="/ilustration.png"
        width={600}
        height={600}
        alt="Background illustration"
        className="absolute max-w-full max-h-full right-0 top-[300%] opacity-25 z-0 hidden lg:block"
      />

      <Image
        src={"/monitors-preview.svg"}
        width={1222}
        height={678}
        alt="Monitors preview"
        className="absolute right-0 top-[50%] lg:top-[40%] z-0 mask-gradient opacity-100 hidden lg:block"
      />

      <div className='max-w-screen w-full flex justify-center h-full scroll-smooth overflow-y-auto overflow-x-hidden'>
        <Topbar
          isLoggedIn={isLoggedIn}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          router={router}
        />

        {/* Hero - ajustado para evitar overflow */}
        <main id="home" className='w-full flex flex-col justify-center items-center mt-12 lg:mt-36 px-4 lg:max-w-[1440px] overflow-x-hidden z-10'>
          <section className='w-full lg:max-w-[1440px] flex flex-col justify-center items-center gap-8'>
            <h1 className='font-swiss text-[24px] lg:text-[96px] text-white text-center'>
              <span className='text-transparent bg-clip-text bg-h1-gradient'>BEAT</span> THE MARKET,<br />
              MAXIMIZE <span className='text-transparent bg-clip-text bg-h1-gradient'>PROFITS</span>
            </h1>
            <span className='font-[24px] text-center text-white/50'>
              Get easy-to-use, super-fast and absolutely accurate<br />
              custom monitors tuned to perfection
            </span>
            <button
              onClick={() => window.open("https://discord.gg/ticketwavemonitors")}
              className="text-white font-semibold text-[16px] bg-button-gradient px-[16px] py-[8px] rounded-[36px] transition-all duration-300 hover:bg-button-hover-gradient">
              Apply now
            </button>
            <Image
              src={"/tw-3d-logo.svg"}
              width={1392}
              height={697}
              alt="TicketWave 3d Logo"
              className='z-10 w-full max-w-[692px] lg:max-w-[1392px] h-auto'
            />
          </section>

          {/* Supported platforms section */}
          <section className='w-full lg:max-w-[1440px] flex flex-col justify-center items-center gap-8 mt-12 lg:mt-36'>
            <div className='flex flex-wrap justify-center items-center gap-[48px]'>
              <h2 className='text-[24px] lg:text-[32px] text-white text-center font-semibold'>
                Supporting over 9 platforms
              </h2>
              <Image
                src={"/platforms/ticketmaster-logo.svg"}
                width={50}
                height={50}
                alt="Ticketmaster Logo"
              />
              <Image
                src={"/platforms/viagogo-logo.svg"}
                width={50}
                height={50}
                alt="Viagogo Logo"
              />
              <Image
                src={"/platforms/axs-logo.svg"}
                width={50}
                height={50}
                alt="AXS Logo"
              />
              <Image
                src={"/platforms/seatgeek-logo.svg"}
                width={50}
                height={50}
                alt="SeatGeek Logo"
              />
              <Image
                src={"/platforms/eventim-logo.svg"}
                width={50}
                height={50}
                alt="AXS Logo"
              />
              <Image
                src={"/platforms/ebilet-logo.svg"}
                width={50}
                height={50}
                alt="Ebilet Logo"
              />

            </div>
          </section>

          {/* Numbers section - ajustado el ancho */}
          <section className='w-full h-[169px] bg-background lg:my-48'>
            {/* Desktop version */}
            <div className='hidden lg:flex items-center justify-center gap-8 px-[24px]'>
              {stats.map((stat, index) => (
                <div key={index} className='flex items-center justify-center gap-8'>
                  <div className='flex flex-col items-center justify-center'>
                    <span className='text-white text-[64px] font-semibold'>{stat.number}</span>
                    <span className='text-white/25 text-sm font-semibold'>{stat.text}</span>
                  </div>
                  {index < stats.length - 1 && (
                    <div className='w-0.5 bg-white/25 h-[80px]'></div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile carousel */}
            <div className='lg:hidden relative h-full flex items-center justify-center px-[24px]'>
              <div className='relative w-full h-full'>
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`absolute w-full min-w-[250px] flex flex-col items-center transition-all duration-500 transform ${index === currentStat
                      ? 'translate-x-0 opacity-100'
                      : index < currentStat
                        ? '-translate-x-full opacity-0'
                        : 'translate-x-full opacity-0'
                      }`}
                  >
                    <span className='text-white text-[48px] font-semibold'>{stat.number}</span>
                    <span className='text-white/25 text-sm font-semibold text-center text-wrap'>{stat.text}</span>
                  </div>
                ))}
              </div>

              {/* Indicators */}
              <div className='absolute bottom-2 left-0 right-0 flex justify-center gap-2'>
                {stats.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStat(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentStat ? 'bg-white' : 'bg-white/25'
                      }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 2n SECTION */}
          <section id="features"
            className='relative w-full min-h-[300vh]'
          >
            <h2 className='font-swiss text-[24px] lg:text-[96px] text-white text-center mb-12'>
              <span className='text-transparent bg-clip-text bg-h1-gradient'>ENJOY</span> THE<br />
              <span className='text-transparent bg-clip-text bg-h1-gradient'>BENEFITS</span>
            </h2>
            <div ref={imageContainer} className='sticky top-0 h-screen w-full flex items-center justify-center bg-background'>
              <div className='max-w-[1440px] w-full px-4 lg:px-24 pb-24'>

                <div className='flex flex-col lg:flex-row justify-between items-center gap-8'>
                  <div className='w-full lg:w-1/2 flex flex-col gap-8'>
                    <div className='flex items-start gap-4 h-48'>
                      <svg width="8" height="142" viewBox="0 0 8 142" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {features.map((_, index) => (
                          <React.Fragment key={index}>
                            <circle
                              cx="4"
                              cy={21 + (index * 20)}
                              r="4"
                              fill={currentFeature === index ? "#6DA5C0" : "#F0F0F0"}
                              fillOpacity={currentFeature === index ? "1" : "0.25"}
                            />
                            {index < features.length - 1 && (
                              <rect
                                x="3.5"
                                y={27 + (index * 20)}
                                width="1"
                                height="8"
                                fill="#F0F0F0"
                                fillOpacity="0.25"
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </svg>

                      <div className='feature-content flex flex-col gap-4 transition-all duration-300'>
                        <div className='flex gap-2 items-center'>
                          <Image
                            src={`/${features[currentFeature].image}`}
                            width={24}
                            height={24}
                            alt={features[currentFeature].title}
                            className='transition-all duration-300'
                          />
                          <span className='text-[#6DA5C0] font-semibold'>
                            {features[currentFeature].hashtag}
                          </span>
                        </div>
                        <h3 className='text-[32px] text-white font-semibold'>
                          {features[currentFeature].title}
                        </h3>
                        <p className='text-[20px] text-white/50'>
                          {features[currentFeature].description}
                        </p>
                      </div>


                    </div>
                    <button className="flex gap-2 items-center justify-start text-white font-semibold group z-30">
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

                  <div className='w-full lg:w-1/2 h-[600px] w-[600px] relative'>
                    <Image
                      src={`/${features[currentFeature].image}`}
                      fill
                      className='object-contain transition-all duration-300'
                      alt={features[currentFeature].title}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='absolute bottom-0 left-0 w-full'>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className='h-screen w-full'
                  onMouseEnter={() => setCurrentFeature(index)}
                />
              ))}
            </div>
          </section>

          {/* Dashboard Preview Section - ajustado el padding */}
          <section className='w-full max-w-[1440px] flex flex-col justify-center items-center gap-8 py-[24px] z-10'>
            <h2 className='font-swiss text-[24px] lg:text-[96px] text-white lg:mt-24 text-center z-10 text-wrap'>
              CLEAR, SIMPLE,<br />
              <span className='text-transparent bg-clip-text bg-h1-gradient'>POWERFUL</span>
            </h2>
            <div className='bg-button-gradient p-[12px] lg:p-[48px] rounded-[24px] flex flex-col items-center justify-center gap-6 w-full'>
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
          <section id="pricing" className='flex flex-col justify-center items-center w-full gap-2 lg:gap-8 py-[10px] py-[24px] z-10'>
            <h2 className='font-swiss text-[24px] lg:text-[96px] text-white lg:mt-24 text-center z-10 text-wrap'>
              <span className='text-transparent bg-clip-text bg-h1-gradient'>CHOOSE</span> THE MOST<br />
              SUITABLE <span className='text-transparent bg-clip-text bg-h1-gradient'>PLAN</span>
            </h2>
            <div className='flex flex-col lg:flex-row items-center justify-end gap-4 lg:gap-8'>
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

          {/* FAQ section - ajustado el padding */}
          <section id="faq" className='flex flex-col justify-center items-center w-full gap-8 py-[24px] z-10'>
            <h2 className='font-swiss text-[24px] lg:text-[96px] text-white lg:mt-24 text-center z-10 text-wrap'>
              ANY <span className='text-transparent bg-clip-text bg-h1-gradient'>QUESTIONS?</span>
            </h2>
            <div className='flex flex-col gap-4'>
              <FaqCard
                title="Who are these monitors suitable for?"
                description={"You can use them as a complete beginner, but also as a super-experienced reseller. First of all, they give you a big head start on the rest of the market, as you'll be instantly notified when tickets are available for the events you're monitoring. They're easy to set up and use, we're happy to help you with everything. "}
              />
              <FaqCard
                title="Who created these monitors?"
                description={"TicketWave is one of the largest and most successful reselling groups in Europe. In the past year we have made over 10 million euros, in total we have bought over 30k tickets on 100+ drops. We have over 5 years of experience in selling tickets for various events from sports and gaming to music around the world. We have our own experienced development team who create these customized tools."}
              />
              <FaqCard
                title="How is it possible that you have all the monitors together?"
                description={"We have our own experienced development team who create these bespoke tools. We work with many platforms, even Viagogo and Stubhub. We regularly monitor the changes that some platforms are trying to protect and secure."}
              />
              <FaqCard
                title="Can I join your reselling group?"
                description={"Our group is currently closed, but you can sign up for the waiting list and if you have high ambitions or reselling experience, we'd love to welcome you. Check out our Whop and Discord."}
              />
            </div>
          </section>

          {/* Footer section */}
          <footer className='w-full h-[510px] flex flex-col lg:flex-row justify-start gap-10 lg:gap-24 items-start lg:items-center p-[24px] z-10'>
            <div className='flex gap-4 flex-col lg:flex-row items-start justify-start'>
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

            <div className='flex justify-center items-start gap-10 lg:items-center lg:gap-28 flex-col lg:flex-row'>
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