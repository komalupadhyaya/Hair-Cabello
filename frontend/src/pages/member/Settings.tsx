import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberLayout from "./MemberLayout";
import { getMyProfile, memberCancelSelf } from "@/services/api";
import {
    User,
    ShieldOff,
    CreditCard,
    Mail,
    Smartphone,
    Scissors,
    Lock,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { AlertModal } from "@/components/ui/AlertModal";

const Settings = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const fetchProfile = async () => {
        try {
            const data = await getMyProfile();
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleCancelConfirm = async () => {
        try {
            await memberCancelSelf();
            toast.success("Subscription has been canceled.");
            fetchProfile();
        } catch (error) {
            toast.error("Failed to cancel subscription. Please contact support.");
        } finally {
            setIsCancelModalOpen(false);
        }
    };

    const handleCancelClick = () => {
        setIsCancelModalOpen(true);
    };

    const PLAN_PRICES: Record<string, number> = { essential: 150, premium: 250, luxury: 350 };

    if (loading) return <MemberLayout><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mt-20"></div></MemberLayout>;
    if (!profile) return <MemberLayout>Not found</MemberLayout>;

    return (
        <MemberLayout>
            <div className="max-w-4xl mx-auto space-y-8 lg:space-y-12 pb-20 selection:bg-blue-100">
                <header>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Account Settings</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage your personal information and subscription preferences.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Primary Settings */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                                <User className="h-5 w-5 text-blue-600" />
                                <h3 className="font-black text-lg tracking-tight">Personal Details</h3>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</p>
                                        <p className="text-md font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{profile.fullName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</p>
                                        <p className="text-md font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{profile.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</p>
                                        <p className="text-md font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{profile.phone || 'Not provided'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Member Since</p>
                                        <p className="text-md font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{new Date(profile.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                                <Scissors className="h-5 w-5 text-blue-600" />
                                <h3 className="font-black text-lg tracking-tight">Hair Profile</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Default Length</p>
                                    <p className="text-md font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{profile.hairLength}"</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Default Type</p>
                                    <p className="text-md font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 capitalize">{profile.hairType?.replace('-', ' ')}</p>
                                </div>
                            </div>
                            <div className="px-8 pb-8">
                                <p className="text-[10px] text-slate-400 font-bold italic">To update these defaults, use the Dashboard preferences for your next order.</p>
                            </div>
                        </section>

                        <section className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-black text-lg tracking-tight">Security</h3>
                                </div>
                            </div>
                            <div className="p-8">
                                <button
                                    onClick={() => navigate('/member/change-password')}
                                    className="flex items-center justify-between w-full group bg-slate-50 hover:bg-white p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                                            <Lock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-slate-800 text-sm">Change Password</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Update your security credentials</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Subscription Tab */}
                    <div className="space-y-8">
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
                            <Sparkles className="h-20 w-20 text-blue-600/10 absolute -right-4 -top-4 rotate-12" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-6">
                                    <CreditCard className="h-4 w-4" />
                                    Current Plan
                                </div>
                                <h3 className="text-3xl font-black mb-1 capitalize tracking-tighter italic">{profile.plan}</h3>
                                <p className="text-slate-400 text-sm font-bold mb-8 tracking-tight">${PLAN_PRICES[profile.plan] || 0} / month</p>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest py-4 border-t border-white/10">
                                        <span className="text-slate-500">Status</span>
                                        <span className={`flex items-center gap-2 ${profile.subscriptionStatus === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${profile.subscriptionStatus === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                                            {profile.subscriptionStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {profile.subscriptionStatus !== 'canceled' && (
                            <button
                                onClick={handleCancelClick}
                                className="w-full flex items-center justify-center gap-3 h-14 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] bg-red-50 hover:bg-red-100 rounded-2xl transition-all border border-red-100"
                            >
                                <ShieldOff className="h-5 w-5" />
                                Cancel Subscription
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={isCancelModalOpen}
                onOpenChange={setIsCancelModalOpen}
                title="Confirm Cancellation"
                description="Are you sure you want to cancel your HairCabello subscription? You will no longer receive monthly hair bundles and exclusive gifts."
                confirmText="Cancel Subscription"
                cancelText="Keep My Membership"
                onConfirm={handleCancelConfirm}
                variant="destructive"
            />
        </MemberLayout>
    );
};

export default Settings;
