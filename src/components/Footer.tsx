import { Link } from "@tanstack/react-router";
import { Github, Instagram, Linkedin, Mail, Phone, Twitter } from "lucide-react";
import logo from "@/assets/rw-logo.jpeg";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="RW" className="h-9 w-9 rounded-md object-cover" />
              <span className="font-bold tracking-tight">
                Rise<span className="text-gradient">Wave</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Creating the Future with AI, Web & Automation. Built by visionaries, for builders.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="transition-smooth hover:text-foreground">About</Link></li>
              <li><Link to="/services" className="transition-smooth hover:text-foreground">Services</Link></li>
              <li><Link to="/portfolio" className="transition-smooth hover:text-foreground">Portfolio</Link></li>
              <li><Link to="/careers" className="transition-smooth hover:text-foreground">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/courses" className="transition-smooth hover:text-foreground">Courses</Link></li>
              <li><Link to="/contact" className="transition-smooth hover:text-foreground">Contact</Link></li>
              <li><Link to="/login" className="transition-smooth hover:text-foreground">Login</Link></li>
              <li><Link to="/signup" className="transition-smooth hover:text-foreground">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>+91 76049 74617</span></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>info.rwsoftwaresolutions@gmail.com</span></li>
            </ul>
            <div className="mt-4 flex gap-3">
              {[
                { Icon: Twitter, href: "#" },
                { Icon: Linkedin, href: "https://www.linkedin.com/company/rw-software-solutions-60230a405" },
                { Icon: Github, href: "#" },
                { Icon: Instagram, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition-smooth hover:border-primary hover:text-primary"
                  aria-label="social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} RiseWave Software Solutions. All rights reserved.</p>
          <p>Built with ambition in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
