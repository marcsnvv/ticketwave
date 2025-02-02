import Navbar from "@/components/ui/navbar";
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({ children }) {
    return (
        <>
            <Navbar />
            <main className="ml-[250px] bg-gradient-to-tl from-primary from-10% via-background via-50% to-background to-100%">
                {children}
            </main>
            <Toaster />
        </>
    );
}