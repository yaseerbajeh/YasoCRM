import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import VerticalNav from '@/components/VerticalNav';

export const metadata: Metadata = {
    title: 'YasoCRM',
    description: 'CRM Dashboard',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
                <Header />
                <div className="flex-1 flex overflow-hidden relative">
                    <VerticalNav />
                    <main className="flex-1 overflow-auto bg-gray-50 relative">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
