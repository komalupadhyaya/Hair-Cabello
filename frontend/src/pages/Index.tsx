import React from 'react';
import CheckoutFunnel from '@/components/CheckoutFunnel';
import { Sparkles, Heart, Zap, ShieldCheck } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter italic">HairCabello</span>
          </div>
          <a href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
            Member Login
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Hero Content */}
          <div className="space-y-8 lg:pt-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-[0.2em]">
              <Zap className="h-3 w-3" /> Monthly Hair Subscriptions
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              The <span className="text-blue-600">Hair Bundle</span> <br /> 
              You Deserve.
            </h1>
            
            <p className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
              Premium Virgin Human Hair bundles delivered to your door every month. 
              Complete with luxury complimentary gifts to keep you glowing. 
              No long-term contracts, just pure hair confidence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <Heart className="h-5 w-5 text-pink-500 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Premium Quality</h4>
                  <p className="text-xs text-slate-400 font-medium">100% Virgin Human Hair only.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Flexible Billing</h4>
                  <p className="text-xs text-slate-400 font-medium">Pause or cancel anytime easily.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Funnel */}
          <div className="w-full max-w-xl mx-auto lg:mr-0 relative">
            <div className="absolute -inset-4 bg-blue-200/20 blur-3xl rounded-[3rem] -z-10" />
            <CheckoutFunnel />
            <p className="mt-6 text-center text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">
              Secure 256-bit SSL Encryption <br />
              Trusted by 10,000+ Happy Members
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t mt-12">
        <div className="container mx-auto px-4 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">© 2026 HairCabello International</p>
            <div className="flex justify-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <a href="#" className="hover:text-blue-600">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600">Terms of Service</a>
                <a href="#" className="hover:text-blue-600">Contact Us</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;