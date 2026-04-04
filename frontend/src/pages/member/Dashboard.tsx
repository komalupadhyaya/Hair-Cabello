import { useEffect, useState } from "react";
import MemberLayout from "./MemberLayout";
import { getMyProfile, updateNextOrderPreferences, createBillingPortal } from "@/services/api";
import {
    Sparkles,
    Calendar,
    Package,
    Scissors,
    Gift,
    ExternalLink,
    CheckCircle2,
    Clock,
    RefreshCw,
    CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

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

const GIFT_LIMITS: Record<string, number> = { essential: 1, premium: 3, luxury: 5 };

const Dashboard = () => {
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Draft preferences for next order
    const [nextPrefs, setNextPrefs] = useState({
        hairLength: '',
        hairType: '',
        gifts: [] as string[]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileData = await getMyProfile();
                setProfile(profileData);
                
                // Initialize next preferences from profile or fall back to current
                setNextPrefs({
                    hairLength: profileData.nextOrderPreferences?.hairLength || profileData.hairLength,
                    hairType: profileData.nextOrderPreferences?.hairType || profileData.hairType,
                    gifts: profileData.nextOrderPreferences?.gifts || profileData.selectedGifts || []
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                if (error instanceof Error && error.message.includes('401')) {
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdatePrefs = async () => {
        setSaving(true);
        try {
            await updateNextOrderPreferences(nextPrefs);
            toast({ title: "Preferences Saved", description: "Your next order has been updated!" });
            
            // Refresh profile to show last updated timestamp if needed
            const updatedProfile = await getMyProfile();
            setProfile(updatedProfile);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleGiftToggle = (gift: string) => {
        const limit = GIFT_LIMITS[profile?.plan] || 0;
        if (nextPrefs.gifts.includes(gift)) {
            setNextPrefs(prev => ({ ...prev, gifts: prev.gifts.filter(g => g !== gift) }));
        } else {
            if (nextPrefs.gifts.length < limit) {
                setNextPrefs(prev => ({ ...prev, gifts: [...prev.gifts, gift] }));
            } else {
                toast({ title: "Limit Reached", description: `Your plan allows max ${limit} gifts.`, variant: "destructive" });
            }
        }
    };

    const handleManageBilling = async () => {
        try {
            const { url } = await createBillingPortal();
            window.location.href = url;
        } catch (error: any) {
            toast({ title: "Billing Portal Error", description: error.message, variant: "destructive" });
        }
    };

    if (loading) return (
        <MemberLayout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </MemberLayout>
    );

    if (!profile) return <MemberLayout><p className="text-center text-slate-500 py-20">User profile not found.</p></MemberLayout>;

    const isActive = profile.subscriptionStatus === 'active';
    const nextBilling = profile.nextBillingDate ? new Date(profile.nextBillingDate).toLocaleDateString() : 'N/A';

    return (
        <MemberLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">HairCabello</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Manage your monthly hair bundle and preferences.</p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="bg-white border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest gap-2"
                        onClick={handleManageBilling}
                    >
                        <CreditCard className="h-4 w-4" /> Manage Billing <ExternalLink className="h-3 w-3 opacity-50" />
                    </Button>
                </header>

                {/* Current Subscription Hero */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 border-blue-100 shadow-sm overflow-hidden">
                        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <Sparkles className="h-5 w-5" />
                                <span className="font-black uppercase tracking-widest text-xs">Current Subscription</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-sm border border-white/30`}>
                                {profile.subscriptionStatus}
                            </span>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</p>
                                        <p className="text-xl font-black text-slate-900 capitalize">{profile.plan} Bundle</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Hair</p>
                                        <p className="text-md font-bold text-slate-700">{profile.hairLength}" / {profile.hairType?.replace('-', ' ')}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Billing Date</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <p className="text-lg font-black text-slate-900">{nextBilling}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Gifts</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {profile.selectedGifts?.map((g: string) => (
                                                <span key={g} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-full border border-slate-200">
                                                    {g}
                                                </span>
                                            ))}
                                            {(!profile.selectedGifts || profile.selectedGifts.length === 0) && <span className="text-xs text-slate-400 italic">None selected</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white border-0 shadow-lg shadow-blue-100 flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Membership</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4 pt-2">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <p className="text-sm font-medium text-slate-300 leading-tight">Monthly delivery of premium hair</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <p className="text-sm font-medium text-slate-300 leading-tight">Exclusive gifts with every box</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <p className="text-sm font-medium text-slate-300 leading-tight">Flexible preferences for next order</p>
                            </div>
                        </CardContent>
                        <div className="p-4 bg-white/5 border-t border-white/10 mt-auto">
                            <p className="text-[10px] text-slate-400 text-center font-bold">MEMBER SINCE {new Date(profile.createdAt).getFullYear()}</p>
                        </div>
                    </Card>
                </div>

                {/* Next Order Preferences */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <RefreshCw className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Next Order Preferences</h2>
                            <p className="text-xs text-slate-500 font-medium">Update your options for the next bundle. Changes must be made 48h before billing.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <Card className="border-slate-200">
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hair Length</Label>
                                    <Select value={nextPrefs.hairLength} onValueChange={v => setNextPrefs(p => ({ ...p, hairLength: v }))}>
                                        <SelectTrigger className="h-12 font-bold text-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="16">16 Inches</SelectItem>
                                            <SelectItem value="18">18 Inches</SelectItem>
                                            <SelectItem value="22">22 Inches</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hair Type</Label>
                                    <Select value={nextPrefs.hairType} onValueChange={v => setNextPrefs(p => ({ ...p, hairType: v }))}>
                                        <SelectTrigger className="h-12 font-bold text-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="body-wave">Body Wave Virgin Human Hair</SelectItem>
                                            <SelectItem value="straight">Straight Virgin Human Hair</SelectItem>
                                            <SelectItem value="curly">Curly Virgin Human Hair</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button 
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold" 
                                    onClick={handleUpdatePrefs}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Next Order Preferences"}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Gift className="h-4 w-4 text-blue-600" /> Next Order Gifts ({nextPrefs.gifts.length}/{GIFT_LIMITS[profile.plan]})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-2">
                                {GIFT_OPTIONS.map(gift => (
                                    <div 
                                        key={gift}
                                        onClick={() => handleGiftToggle(gift)}
                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                            nextPrefs.gifts.includes(gift) 
                                                ? "border-blue-200 bg-blue-50" 
                                                : "border-slate-100 hover:border-slate-200"
                                        }`}
                                    >
                                        <Checkbox checked={nextPrefs.gifts.includes(gift)} className="mr-3" />
                                        <span className="text-xs font-bold text-slate-600">{gift}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </MemberLayout>
    );
};

export default Dashboard;
