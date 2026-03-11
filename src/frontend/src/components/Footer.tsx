import { FileText } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string, toolSlug?: string) => void;
}

const FOOTER_LINKS = [
  { label: "Merge PDF", slug: "merge-pdf" },
  { label: "Split PDF", slug: "split-pdf" },
  { label: "Compress PDF", slug: "compress-pdf" },
  { label: "PDF to Word", slug: "pdf-to-word" },
  { label: "Protect PDF", slug: "protect-pdf" },
  { label: "Sign PDF", slug: "sign-pdf" },
];

const COMPANY_LINKS = [
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Pricing", page: "pricing" },
  { label: "API", href: "#" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

export function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "luxpdf")}`;

  return (
    <footer className="border-t border-border/40 bg-card/50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold-dark">
                <FileText className="h-4 w-4 text-background" />
              </div>
              <span className="font-display text-xl font-black">
                Lux<span className="text-gold-gradient">PDF</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The premium PDF toolkit that gives you more for free. No anxiety,
              no forced signups.
            </p>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold/70">
              Popular Tools
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link, i) => (
                <li key={link.slug}>
                  <button
                    type="button"
                    data-ocid={`footer.link.${i + 1}`}
                    onClick={() => onNavigate("tool", link.slug)}
                    className="text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold/70">
              Company
            </h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link, i) => (
                <li key={link.label}>
                  {link.page ? (
                    <button
                      type="button"
                      data-ocid={`footer.link.${FOOTER_LINKS.length + i + 1}`}
                      onClick={() => onNavigate(link.page!)}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      data-ocid={`footer.link.${FOOTER_LINKS.length + i + 1}`}
                      href={link.href}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold/70">
              Legal
            </h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link, i) => (
                <li key={link.label}>
                  <a
                    data-ocid={`footer.link.${FOOTER_LINKS.length + COMPANY_LINKS.length + i + 1}`}
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>
            © {year}. Built with ❤️ using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/70 transition hover:text-gold"
            >
              caffeine.ai
            </a>
          </p>
          <p>
            All PDF processing happens in your browser. Your files never leave
            your device.
          </p>
        </div>
      </div>
    </footer>
  );
}
