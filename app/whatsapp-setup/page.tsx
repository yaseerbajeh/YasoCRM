'use client';

import { useState, useEffect } from 'react';
import { QrCode, CheckCircle, XCircle, RefreshCw, Smartphone } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function WhatsAppSetup() {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [loading, setLoading] = useState(false);
    const [instanceInfo, setInstanceInfo] = useState<any>(null);

    // Check instance status
    const checkStatus = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/test/evolution-status`);
            if (response.data.state === 'open') {
                setStatus('connected');
                setInstanceInfo(response.data);
            } else {
                setStatus('disconnected');
            }
        } catch (error) {
            console.error('Error checking status:', error);
            setStatus('disconnected');
        }
    };

    // Get QR code
    const getQRCode = async () => {
        setLoading(true);
        setStatus('connecting');
        try {
            const response = await axios.get(`${API_URL}/api/test/evolution-qr`);
            if (response.data.qrcode) {
                setQrCode(response.data.qrcode);
            }
        } catch (error) {
            console.error('Error getting QR code:', error);
        } finally {
            setLoading(false);
        }
    };

    // Sync contacts from WhatsApp
    const syncContacts = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/test/sync-contacts`);
            alert(`✅ Synced ${response.data.count} contacts from WhatsApp!`);
        } catch (error) {
            console.error('Error syncing contacts:', error);
            alert('❌ Failed to sync contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <Sidebar />

            <main className="flex h-full flex-1 flex-col">
                <TopNavbar />

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900">إعداد WhatsApp</h1>
                            <p className="mt-2 text-slate-600">قم بربط حساب WhatsApp الخاص بك مع النظام</p>
                        </div>

                        {/* Status Card */}
                        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`flex size-16 items-center justify-center rounded-full ${status === 'connected' ? 'bg-green-100' :
                                            status === 'connecting' ? 'bg-yellow-100' : 'bg-red-100'
                                        }`}>
                                        {status === 'connected' ? (
                                            <CheckCircle className="size-8 text-green-600" />
                                        ) : status === 'connecting' ? (
                                            <RefreshCw className="size-8 animate-spin text-yellow-600" />
                                        ) : (
                                            <XCircle className="size-8 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {status === 'connected' ? 'متصل' :
                                                status === 'connecting' ? 'جاري الاتصال...' : 'غير متصل'}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {status === 'connected' ? 'WhatsApp متصل ويعمل بشكل صحيح' :
                                                status === 'connecting' ? 'يرجى مسح رمز QR' : 'قم بمسح رمز QR للاتصال'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={checkStatus}
                                    className="rounded-lg bg-slate-100 p-3 transition-colors hover:bg-slate-200"
                                >
                                    <RefreshCw className="size-5 text-slate-600" />
                                </button>
                            </div>

                            {status === 'connected' && instanceInfo && (
                                <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
                                    <div>
                                        <p className="text-xs text-slate-500">اسم المثيل</p>
                                        <p className="font-medium text-slate-900">{instanceInfo.instance || 'ksagamingtv'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">رقم الهاتف</p>
                                        <p className="font-medium text-slate-900">{instanceInfo.number || 'متصل'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* QR Code Card */}
                        {status !== 'connected' && (
                            <div className="mb-6 rounded-xl bg-white p-8 shadow-sm">
                                <div className="text-center">
                                    {!qrCode ? (
                                        <div>
                                            <div className="mb-6 flex justify-center">
                                                <div className="flex size-32 items-center justify-center rounded-full bg-blue-50">
                                                    <Smartphone className="size-16 text-blue-600" />
                                                </div>
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold text-slate-900">ابدأ الاتصال</h3>
                                            <p className="mb-6 text-slate-600">اضغط على الزر أدناه للحصول على رمز QR</p>
                                            <button
                                                onClick={getQRCode}
                                                disabled={loading}
                                                className="rounded-lg bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
                                            >
                                                {loading ? 'جاري التحميل...' : 'الحصول على رمز QR'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="mb-4 text-xl font-bold text-slate-900">امسح رمز QR</h3>
                                            <div className="mb-6 flex justify-center">
                                                <div className="rounded-xl bg-white p-4 shadow-lg">
                                                    <img src={qrCode} alt="QR Code" className="size-64" />
                                                </div>
                                            </div>
                                            <div className="mx-auto max-w-md space-y-2 text-right text-sm text-slate-600">
                                                <p>١. افتح WhatsApp على هاتفك</p>
                                                <p>٢. اضغط على القائمة أو الإعدادات واختر الأجهزة المرتبطة</p>
                                                <p>٣. اضغط على ربط جهاز</p>
                                                <p>٤. وجه هاتفك نحو هذه الشاشة لمسح الرمز</p>
                                            </div>
                                            <button
                                                onClick={getQRCode}
                                                className="mt-6 text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                تحديث رمز QR
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions Card */}
                        {status === 'connected' && (
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-bold text-slate-900">الإجراءات</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <button
                                        onClick={syncContacts}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-blue-50 px-6 py-4 font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                                    >
                                        <RefreshCw className={`size-5 ${loading ? 'animate-spin' : ''}`} />
                                        مزامنة جهات الاتصال
                                    </button>
                                    <button
                                        onClick={() => window.location.href = '/contacts'}
                                        className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-6 py-4 font-medium text-slate-900 transition-colors hover:bg-slate-200"
                                    >
                                        عرض جهات الاتصال
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
