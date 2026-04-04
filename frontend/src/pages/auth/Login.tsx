import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@/services/api";
import { Sparkles, Mail, Lock, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            toast.success("Welcome back to HairCabello!");

            if (data.user.forcePasswordChange) {
                navigate("/member/change-password");
            } else {
                navigate("/member/dashboard");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans selection:bg-blue-100">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-xl shadow-blue-500/5 mb-6 border border-slate-100">
                        <Sparkles className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">HairCabello</h1>
                    <p className="text-slate-500 mt-2 font-medium">Member Portal Login</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-slate-200 p-10 shadow-2xl shadow-blue-100/20 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="email"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-slate-900 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                <button type="button" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="password"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-slate-900 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group uppercase tracking-widest text-xs"
                    >
                        {loading ? "Authenticating..." : (
                            <>
                                Sign In
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Don't have an account? <br />
                        <Link to="/" className="text-blue-600 hover:underline mt-1 inline-block">View Subscription Bundles</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
