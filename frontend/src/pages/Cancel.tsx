import { XCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Cancel = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 selection:bg-blue-100 italic">
        <div className="text-center max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-slate-100">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-50 border border-red-100 shadow-inner">
                <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Checkout Canceled</h1>
            <p className="text-md text-slate-500 font-medium mb-10 leading-relaxed">
                Your subscription was not completed. No charges were made. You can revisit our bundles and try again when you're ready.
            </p>
            <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 w-full h-14 rounded-2xl bg-slate-900 text-white text-sm font-black uppercase tracking-widest hover:shadow-xl transition-all"
            >
                <ArrowLeft className="h-4 w-4" /> View Bundles
            </Link>
        </div>
    </div>
);

export default Cancel;
