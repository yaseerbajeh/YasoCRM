'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/conversations');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-blue-600">
          <span className="text-2xl font-bold text-white">A</span>
        </div>
        <p className="text-slate-600">جاري التحميل...</p>
      </div>
    </div>
  );
}
