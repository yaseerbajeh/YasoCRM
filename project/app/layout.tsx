import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import VerticalNav from '@/components/VerticalNav';

const inter = Inter({ subsets: ['latin'] });

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
            <body className={`${inter.className} h-screen flex flex-col bg-gray-50 overflow-hidden`}>
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
