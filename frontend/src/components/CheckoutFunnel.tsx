import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, ArrowRight, ArrowLeft, Package, Scissors, Gift, User, CreditCard } from 'lucide-react';
import { startSignup, SignupPayload } from '@/services/api';

const STEPS = ['Account', 'Package', 'Hair Options', 'Gifts', 'Review'];

const GIFT_OPTIONS = [
    'Eyeliner',
    'Natural Glow Lip Gloss',
    'Organic Lotion',
    'Mascara',
    'Edge Control',
    'Hair Bonnet',
    'Standard Reusable Eyelashes',
    'Organic Facial Scrub/Cleanser'
];

const PACKAGES = [
    { id: 'essential', name: 'Essential Bundle', price: 150, gifts: 1 },
    { id: 'premium', name: 'Premium Bundle', price: 250, gifts: 3 },
    { id: 'luxury', name: 'Luxury Bundle', price: 350, gifts: 5 }
];

const CheckoutFunnel = () => {
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState<SignupPayload>({
        fullName: '',
        email: '',
        phone: '',
        plan: 'essential',
        hairLength: '18',
        hairType: 'body-wave',
        selectedGifts: [],
        password: '',
    });

    const updateFormData = (updates: Partial<SignupPayload>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => {
        if (step === 0 && (!formData.fullName || !formData.email || !formData.phone || !formData.password)) {
            toast({ title: "Required Fields", description: "Please fill in all account details.", variant: "destructive" });
            return;
        }
        setStep(prev => Math.min(prev + 1, STEPS.length - 1));
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

    const handleGiftToggle = (gift: string) => {
        const limit = PACKAGES.find(p => p.id === formData.plan)?.gifts || 0;
        const current = formData.selectedGifts;
        
        if (current.includes(gift)) {
            updateFormData({ selectedGifts: current.filter(g => g !== gift) });
        } else {
            if (current.length < limit) {
                updateFormData({ selectedGifts: [...current, gift] });
            } else {
                toast({ 
                    title: "Limit Reached", 
                    description: `Your ${formData.plan} plan allows a maximum of ${limit} gifts.`, 
                    variant: "destructive" 
                });
            }
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            const res = await startSignup(formData);
            window.location.href = res.url; // Redirect to Stripe
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const progress = ((step + 1) / STEPS.length) * 100;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <span>{STEPS[step]}</span>
                    <span>Step {step + 1} of {STEPS.length}</span>
                </div>
                <Progress value={progress} className="h-1.5" />
            </div>

            {step === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" /> Account Details
                        </CardTitle>
                        <CardDescription>Enter your contact info to create your member portal.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={formData.fullName} onChange={e => updateFormData({ fullName: e.target.value })} placeholder="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => updateFormData({ email: e.target.value })} placeholder="jane@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={formData.phone} onChange={e => updateFormData({ phone: e.target.value })} placeholder="(555) 000-0000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={formData.password} onChange={e => updateFormData({ password: e.target.value })} placeholder="Min 8 characters" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={nextStep}>
                            Next: Select Package <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" /> Select Package
                        </CardTitle>
                        <CardDescription>Choose the monthly hair bundle that fits your needs.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4">
                        {PACKAGES.map((pkg) => (
                            <div 
                                key={pkg.id}
                                onClick={() => updateFormData({ plan: pkg.id as any, selectedGifts: [] })}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.plan === pkg.id 
                                        ? "border-blue-600 bg-blue-50/50 shadow-md scale-[1.02]" 
                                        : "border-slate-100 hover:border-slate-200"
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{pkg.name}</h3>
                                        <p className="text-sm text-slate-500">{pkg.gifts} complimentary gift{pkg.gifts > 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-slate-900">${pkg.price}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Per Month</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                        <Button className="flex-[2]" onClick={nextStep}>Next: Options <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </CardFooter>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scissors className="h-5 w-5 text-blue-600" /> Hair Options
                        </CardTitle>
                        <CardDescription>Customize your bundle length and type.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Hair Length</Label>
                            <Select value={formData.hairLength} onValueChange={v => updateFormData({ hairLength: v as any })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select length" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="16">16 Inches</SelectItem>
                                    <SelectItem value="18">18 Inches</SelectItem>
                                    <SelectItem value="22">22 Inches</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Hair Type</Label>
                            <Select value={formData.hairType} onValueChange={v => updateFormData({ hairType: v as any })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="body-wave">Body Wave Virgin Human Hair</SelectItem>
                                    <SelectItem value="straight">Straight Virgin Human Hair</SelectItem>
                                    <SelectItem value="curly">Curly Virgin Human Hair</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                        <Button className="flex-[2]" onClick={nextStep}>Next: Pick Gifts <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </CardFooter>
                </Card>
            )}

            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-blue-600" /> Complimentary Gifts
                        </CardTitle>
                        <CardDescription>
                            Pick {PACKAGES.find(p => p.id === formData.plan)?.gifts} gift(s) included in your plan.
                            ({formData.selectedGifts.length} selected)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-2">
                            {GIFT_OPTIONS.map((gift) => (
                                <div 
                                    key={gift}
                                    onClick={() => handleGiftToggle(gift)}
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                        formData.selectedGifts.includes(gift) 
                                            ? "border-blue-200 bg-blue-50" 
                                            : "border-slate-100 hover:border-slate-200"
                                    }`}
                                >
                                    <Checkbox checked={formData.selectedGifts.includes(gift)} className="mr-3" />
                                    <span className="text-sm font-medium text-slate-700">{gift}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                        <Button className="flex-[2]" onClick={nextStep}>Review Order <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </CardFooter>
                </Card>
            )}

            {step === 4 && (
                <Card className="border-blue-100 shadow-lg shadow-blue-50">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" /> Review Subscription
                        </CardTitle>
                        <CardDescription>Confirm your order details before payment.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            <div className="p-5 flex justify-between">
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-tighter">Plan</span>
                                <span className="text-sm font-bold text-slate-900 capitalize">{formData.plan} Bundle</span>
                            </div>
                            <div className="p-5 flex justify-between">
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-tighter">Hair</span>
                                <span className="text-sm font-bold text-slate-900">{formData.hairLength}" / {formData.hairType.replace('-', ' ')}</span>
                            </div>
                            <div className="p-5">
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-tighter block mb-2">Selected Gifts</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {formData.selectedGifts.map(g => (
                                        <span key={g} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100">
                                            {g}
                                        </span>
                                    ))}
                                    {formData.selectedGifts.length === 0 && <span className="text-xs text-slate-400 italic">No gifts selected</span>}
                                </div>
                            </div>
                            <div className="p-6 bg-blue-50/30 flex justify-between items-center">
                                <span className="font-bold text-slate-900">Monthly Total</span>
                                <span className="text-2xl font-black text-blue-600">${PACKAGES.find(p => p.id === formData.plan)?.price}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 p-6 pt-0 mt-6">
                        <Button 
                            className="w-full h-12 text-md font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200" 
                            size="lg" 
                            disabled={loading}
                            onClick={handleFinish}
                        >
                            {loading ? "Redirecting to Stripe..." : "Continue to Secure Checkout"}
                        </Button>
                        <Button variant="ghost" className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest" onClick={prevStep}>
                            Edit Details
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
};

export default CheckoutFunnel;
