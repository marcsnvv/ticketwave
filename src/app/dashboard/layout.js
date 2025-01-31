import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({ children }) {
    return (
        <html lang="en">
            <body className="h-screen">
                <Navbar />
                <main className="absolute w-5/6 right-0 bg-gradient-to-tl from-primary from-10% via-background via-50% to-background to-100%">
                    {children}
                </main>
                {/* <Footer /> */}
                <Toaster />
            </body>
        </html>

    );
}