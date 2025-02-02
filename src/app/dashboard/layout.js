import Navbar from "@/components/ui/navbar";
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({ children }) {
    return (
        <>
            <Navbar />
            <main className="ml-[250px]">
                {children}
            </main>
            <Toaster />
        </>
    );
}