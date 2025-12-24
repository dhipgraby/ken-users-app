import Link from "next/link";
import FrameworkLogo from "@/components/framework-logo";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400 via-emerald-600 to-emerald-900 overflow-hidden px-4 text-center">
      {/* Animated Floating Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[10%] opacity-10 animate-float-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m5 12 5 5 9-9" /></svg>
        </div>
        <div className="absolute bottom-[30%] right-[20%] opacity-10 animate-float-fast">
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
        </div>
        <div className="absolute top-[30%] left-[8%] opacity-10 animate-float-slow">
          <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M2 12h20" /></svg>
        </div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-emerald-400/20 blur-[150px] rounded-full animate-pulse-slow" />
      </div>

      <div className="absolute top-10 flex flex-col items-center gap-4 z-20">
        <FrameworkLogo variant="dark" size={120} />
        <span className="text-3xl font-bold text-white tracking-tight">Ken Framework</span>
      </div>

      <div className="max-w-4xl space-y-10 relative z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
            v2.0 Enterprise
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[0.9] drop-shadow-sm">
            Build Smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-50 to-emerald-200">
              Launch Faster.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-50/90 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            The ultimate blueprint for high-performance applications. <br className="hidden md:block" />
            Scalable, secure, and engineered for the modern web.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            asChild
            size="lg"
            className="h-16 px-12 rounded-2xl bg-emerald-950 text-white hover:bg-emerald-900 text-xl font-bold shadow-2xl transition-all hover:scale-105 active:scale-95 border border-emerald-800/50"
          >
            <Link href="/auth/signup">
              Get Started Now
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="h-16 px-10 rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/20 text-xl font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95 border-2"
          >
            <Link href="/auth/login">
              Sign In
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 text-emerald-100/40 text-xs font-bold uppercase tracking-[0.2em] z-20">
        Ready for Production • © 2024 Ken Framework
      </div>
    </main>
  );
}
