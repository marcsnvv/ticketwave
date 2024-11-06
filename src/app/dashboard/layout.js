import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

export default function DashboardLayout({ children }) {
    return (
        <html lang="en">
            <body className="h-screen">
                <Navbar />
                {children}
            </body>
        </html>
    );
}