import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, ArrowRight, Package, ShoppingBag, Calendar } from "lucide-react";
import { getSessionDetails, SessionDetails } from "@/services/api";

const Success = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const navigate = useNavigate();

    const [details, setDetails] = useState<SessionDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            navigate("/");
            return;
        }

        let pollCount = 0;
        const maxPolls = 15; // 30 seconds total
        let pollInterval: NodeJS.Timeout;

        const fetchDetails = async () => {
            try {
                const data = await getSessionDetails(sessionId);
                console.log("Session details fetched:", data);
                
                // If the user has a nextBillingDate, it means the webhook has processed
                if (data.nextBillingDate) {
                    setDetails(data);
                    setLoading(false);
                    if (pollInterval) clearInterval(pollInterval);
                } else {
                    // Still waiting for webhook
                    pollCount++;
                    if (pollCount >= maxPolls) {
                        setDetails(data); // Show what we have
                        setLoading(false);
                        if (pollInterval) clearInterval(pollInterval);
                    }
                }
            } catch (err) {
                console.error("Error fetching session details:", err);
                setError("Failed to load your subscription details.");
                setLoading(false);
                if (pollInterval) clearInterval(pollInterval);
            }
        };

        fetchDetails();
        pollInterval = setInterval(fetchDetails, 2000);

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [sessionId, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Processing Your Subscription...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-blue-100">
            <main className="max-w-[560px] w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-100 border border-slate-100 overflow-hidden">
                {error ? (
                    <div className="p-12 text-center">
                        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                            <span className="text-red-600 text-2xl font-black">!</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">Something went wrong</h1>
                        <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">{error}</p>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-slate-900 text-white font-bold rounded-xl py-4 text-sm hover:shadow-lg transition-all"
                        >
                            Return to Home
                        </button>
                    </div>
                ) : details && (
                    <>
                        {/* Hero Header */}
                        <div className="bg-blue-600 p-10 text-center relative overflow-hidden">
                            <Sparkles className="h-32 w-32 text-white/10 absolute -right-8 -top-8 rotate-12" />
                            <div className="relative z-10 text-white">
                                <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-xl">
                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-black tracking-tighter italic mb-2">Welcome to HairCabello!</h1>
                                <p className="text-blue-100 text-sm font-bold uppercase tracking-widest">
                                    Your first bundle is being prepared.
                                </p>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Member</p>
                                    <p className="text-slate-900 font-black tracking-tight">{details.name}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Plan</p>
                                    <p className="text-slate-900 font-black tracking-tight capitalize">{details.plan} Bundle</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Pricing</p>
                                    <p className="text-slate-900 font-black tracking-tight">${details.price}/month</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Active Since</p>
                                    <p className="text-slate-900 font-black tracking-tight">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Hair Config Box */}
                            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Your Selection</h3>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                                            <ShoppingBag className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{details.hairLength}" {details.hairType?.replace('-', ' ')}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Premium Virgin Bundle</p>
                                        </div>
                                    </div>
                                </div>
                                {details.selectedGifts?.length > 0 && (
                                    <div className="pt-3 border-t border-slate-200/50 flex flex-wrap gap-1.5">
                                        {details.selectedGifts.map(g => (
                                            <span key={g} className="px-2.5 py-0.5 bg-white text-blue-600 text-[9px] font-black rounded-full border border-blue-100 shadow-sm uppercase">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Next Billing Notice */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50/30">
                                <Calendar className="h-6 w-6 text-blue-600" />
                                <div>
                                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Next Billing Date</p>
                                    <p className="text-sm font-black text-slate-900">
                                        {details.nextBillingDate ? new Date(details.nextBillingDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* What's Next */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">What's Next?</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-blue-600">1</div>
                                        <p className="text-sm font-medium text-slate-600">Confirmation email sent to <span className="font-bold text-slate-900">{details.email}</span></p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-blue-600">2</div>
                                        <p className="text-sm font-medium text-slate-600">Shipping takes 3-5 business days.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-blue-600">3</div>
                                        <p className="text-sm font-medium text-slate-600">Manage your subscription in the member portal.</p>
                                    </li>
                                </ul>
                            </div>

                            {/* Final CTA */}
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full bg-slate-900 text-white font-black rounded-2xl py-5 text-sm hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest"
                            >
                                Enter Member Portal
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Success;
