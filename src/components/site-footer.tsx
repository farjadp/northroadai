//src/components/site-footer.tsx
"use client";

import Link from "next/link";
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Mail, 
  ArrowRight, 
  Activity, 
  Command 
} from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#050505] border-t border-white/5 pt-16 pb-8 overflow-hidden">
      
      {/* --- DECORATIVE TOP GLOW --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-12 bg-cyan-500/5 blur-[40px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* COLUMN 1: BRANDING (4 Cols) */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_rgba(8,145,178,0.4)] group-hover:shadow-[0_0_25px_rgba(8,145,178,0.6)] transition-all duration-500">
                NR
              </div>
              <span className="font-mono font-bold text-white tracking-tight text-lg">North Road AI</span>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The neural interface for startup founders. We combine AI speed with human wisdom to reduce failure rates in the ecosystem.
            </p>

            <div className="flex items-center gap-4">
               <SocialIcon icon={<Twitter size={18}/>} href="#" />
               <SocialIcon icon={<Linkedin size={18}/>} href="#" />
               <SocialIcon icon={<Github size={18}/>} href="#" />
               <SocialIcon icon={<Mail size={18}/>} href="mailto:hello@northroad.ai" />
            </div>
          </div>

          {/* COLUMN 2: PRODUCT (2 Cols) */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">System</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <FooterLink href="/access">Pricing Access</FooterLink>
              <FooterLink href="/dashboard">Live Demo</FooterLink>
              <FooterLink href="/protocol">The Protocol</FooterLink>
              <FooterLink href="/manifesto">Manifesto</FooterLink>
            </ul>
          </div>

          {/* COLUMN 3: RESOURCES (2 Cols) */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Data Nodes</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <FooterLink href="#">Startup Library</FooterLink>
              <FooterLink href="#">Founder Stories</FooterLink>
              <FooterLink href="#">API Docs</FooterLink>
              <FooterLink href="#">System Status</FooterLink>
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER (4 Cols) */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Neural Updates</h4>
            <p className="text-xs text-slate-500">
              Join 4,000+ founders receiving weekly tactical downloads. No noise.
            </p>
            
            <form className="relative flex items-center">
                <Command className="absolute left-3 text-slate-600 w-4 h-4" />
                <input 
                  type="email" 
                  placeholder="founder@startup.com" 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-3 pl-10 pr-12 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
                />
                <button className="absolute right-1.5 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors">
                  <ArrowRight size={14} />
                </button>
            </form>

            <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                SYSTEMS OPERATIONAL
            </div>
          </div>

        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-xs text-slate-500 font-mono">
             © {currentYear} NORTH ROAD AI INC. // TORONTO, CA.
           </p>
           
           <div className="flex gap-6 text-xs text-slate-500 font-medium">
             <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
             <Link href="#" className="hover:text-white transition-colors">Security</Link>
           </div>
        </div>

      </div>
    </footer>
  );
}

// --- SUB COMPONENTS ---

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-cyan-400 transition-colors flex items-center gap-2 group">
        <span className="w-0 group-hover:w-2 h-px bg-cyan-500 transition-all duration-300"></span>
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a 
      href={href} 
      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
    >
      {icon}
    </a>
  );
}