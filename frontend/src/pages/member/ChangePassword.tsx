import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "@/services/api";
import { Sparkles, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ChangePassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("The passwords you entered do not match.");
            return;
        }

        setLoading(true);
        try {
            await changePassword(password);

            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.forcePasswordChange = false;
                localStorage.setItem('user', JSON.stringify(user));
            }

            toast.success("Security updated. Welcome to HairCabello!");
            navigate("/member/dashboard");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-10 pb-20 px-6 items-center justify-center selection:bg-blue-100">
            <nav className="max-w-xl mx-auto w-full mb-10 flex items-center justify-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter italic">HairCabello</span>
            </nav>

            <main className="max-w-[440px] mx-auto w-full">
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-100 p-10 border border-slate-100">
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Secure Your Account</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Set a permanent password to access your hair profile.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                                placeholder="Min 8 characters"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                                placeholder="Repeat password"
                                required
                            />
                        </div>

                        <ul className="space-y-2 py-2">
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <CheckCircle2 className={`h-4 w-4 ${password.length >= 8 ? 'text-green-500' : 'text-slate-300'}`} />
                                At least 8 characters
                            </li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <CheckCircle2 className={`h-4 w-4 ${password === confirmPassword && password !== "" ? 'text-green-500' : 'text-slate-300'}`} />
                                Passwords match
                            </li>
                        </ul>

                        <button
                            type="submit"
                            disabled={loading || !password || password !== confirmPassword}
                            className="w-full h-14 flex items-center justify-center gap-2 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-xs"
                        >
                            {loading ? "Updating..." : "Update & Continue"}
                            {!loading && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ChangePassword;
