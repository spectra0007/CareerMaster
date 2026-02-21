'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check, ArrowLeft } from 'lucide-react';
import Script from 'next/script';

export default function PricingPage() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!isSignedIn) {
            router.push('/sign-in?redirect_url=/pricing');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            setAuthToken(token);

            // Step 1: Create an order on the backend
            const res = await api.post('/subscriptions/order');

            if (res.order) {
                // Step 2: Initialize Razorpay Checkout
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: res.order.amount,
                    currency: res.order.currency,
                    name: 'CareerMaster',
                    description: 'CareerMaster Pro Subscription',
                    order_id: res.order.id, // The order ID created in the backend
                    handler: async function (response) {
                        // Step 3: Verify the payment back to the server
                        try {
                            setAuthToken(token);
                            await api.post('/subscriptions/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });
                            alert('Payment successful! You are now a PRO member.');
                            router.push('/dashboard');
                        } catch (err) {
                            alert('Payment Verification failed. Please contact support.');
                        }
                    },
                    prefill: {
                        name: user?.fullName || '',
                        email: user?.primaryEmailAddress?.emailAddress || '',
                    },
                    theme: {
                        color: '#2563EB', // blue-600
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    alert('Payment Failed: ' + response.error.description);
                });
                rzp.open();
            }
        } catch (err) {
            console.error('Checkout failed', err);
            alert('Failed to initiate checkout: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-12">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="max-w-7xl mx-auto px-4 w-full">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Simple, transparent pricing</h1>
                    <p className="mt-4 text-xl text-gray-500">Everything you need to land your dream engineering role.</p>
                </div>

                <div className="flex justify-center">
                    <Card className="w-full max-w-md border-blue-200 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-2 bg-blue-600"></div>
                        <CardHeader className="text-center pb-8 pt-8">
                            <CardTitle className="text-2xl text-gray-900">CareerMaster Pro</CardTitle>
                            <CardDescription className="text-base mt-2">Unlock all premium pathways and videos.</CardDescription>
                            <div className="mt-6 flex items-baseline justify-center gap-x-2">
                                <span className="text-5xl font-bold tracking-tight text-gray-900">₹2499</span>
                                <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4 text-sm leading-6 text-gray-600">
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                                    Full access to 50+ System Design videos
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                                    Curated LeetCode pathways (Blind 75 & NeetCode 150)
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                                    Behavioral interview mock recordings
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                                    Priority support
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter className="pt-8">
                            <Button
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                                onClick={handleSubscribe}
                                disabled={loading || !isLoaded}
                            >
                                {loading ? 'Processing...' : 'Subscribe Now'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
