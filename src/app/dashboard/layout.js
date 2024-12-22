import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({ children }) {
    return (
        <html lang="en">
            <body className="h-screen">
                <Navbar />
                <main className="mt-16">
                    {children}
                </main>
                {/* <Footer /> */}
                <Toaster />
            </body>
        </html>
    );
}