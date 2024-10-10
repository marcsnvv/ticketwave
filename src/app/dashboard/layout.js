import Navbar from "@/components/ui/navbar";

export default function DashboardLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Navbar />
                {children}
            </body>
        </html>
    );
}