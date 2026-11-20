import {
  interactionAnalyticsConfigured,
  isPublicAnalyticsPath,
  setPublicInteractionCapture,
} from "@/app/analytics";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import {
  Menu,
  ArrowUpRight,
  LogOut,
  X,
  BriefcaseBusiness,
  UserRound,
  Bookmark,
  FileText,
  Users,
  Building2,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { BrandMark } from "@/features/public/brand-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import { currentPerson } from "./model";
import { usePrototype } from "./store";
import { cn } from "@/lib/utils";
const navigation = [
  { to: "/oferty", label: "Oferty" },
  { to: "/metodologia", label: "Metodologia" },
  { to: "/auth/sign-in?audience=employer&next=/app/oferty", label: "Dla firm" },
];

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="prototype-notice">
      {children}
    </div>
  );
}
export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="page-heading">
      <h1>{children}</h1>
      {action}
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="prototype-panel">{children}</div>;
}
export function NotFound() {
  return (
    <section className="prototype-section">
      <h1>Nie znaleziono strony</h1>
      <p className="my-5">Ten adres nie prowadzi do dostępnej oferty lub aplikacji.</p>
      <Link className={buttonVariants()} to="/oferty">
        Wróć do ofert
      </Link>
    </section>
  );
}
const candidateNav = [
  ["/app", "Przegląd", LayoutDashboard],
  ["/app/profil", "Profil", UserRound],
  ["/app/zapisane", "Zapisane oferty", Bookmark],
  ["/app/aplikacje", "Moje aplikacje", FileText],
] as const;
const employerNav = [
  ["/app", "Przegląd", LayoutDashboard],
  ["/app/oferty", "Moje oferty", BriefcaseBusiness],
  ["/app/kandydaci", "Kandydaci", Users],
  ["/app/organizacja", "Organizacja", Building2],
] as const;
export function Shell() {
  const { state, issue, error, clearError } = usePrototype();
  const person = currentPerson(state);
  const { pathname } = useLocation();
  const publicView = !person && isPublicAnalyticsPath(pathname);
  const [interactionConsent, setInteractionConsent] = useState<boolean | null>(() => {
    try {
      const saved = window.sessionStorage.getItem("doroboty.recording-consent");
      return saved === "allowed" ? true : saved === "declined" ? false : null;
    } catch {
      return null;
    }
  });
  useLayoutEffect(() => {
    try {
      if (interactionConsent === null)
        window.sessionStorage.removeItem("doroboty.recording-consent");
      else
        window.sessionStorage.setItem(
          "doroboty.recording-consent",
          interactionConsent ? "allowed" : "declined",
        );
    } catch {
      // Consent remains in memory when browser storage is unavailable.
    }
  }, [interactionConsent]);
  const captureInteractions =
    interactionAnalyticsConfigured && publicView && interactionConsent === true;
  useLayoutEffect(() => {
    setPublicInteractionCapture(captureInteractions);
    return () => setPublicInteractionCapture(false);
  }, [captureInteractions]);
  const workspace = pathname.startsWith("/app") && person;
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const main = useRef<HTMLElement>(null);
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      clearError();
      main.current?.focus();
      window.scrollTo(0, 0);
      lastPath.current = pathname;
    }
  }, [pathname, clearError]);
  const nav =
    person?.role === "employer"
      ? employerNav
      : person?.role === "operator"
        ? [["/app/case", "Materiały case study", FileText] as const]
        : candidateNav;
  const content = (
    <>
      <>
        {issue && (
          <Notice>
            {issue}{" "}
            <Link className="underline" to="/app/settings">
              Ustawienia danych
            </Link>
          </Notice>
        )}
      </>
      {error && (
        <p className="prototype-error" role="alert">
          {error}
        </p>
      )}
      <div key={`${state.activePersonId}:${pathname}`}>
        <Outlet />
        {interactionAnalyticsConfigured && pathname === "/polityka-prywatnosci" && (
          <section
            data-private-analytics
            aria-labelledby="recording-settings"
            className="prototype-section max-w-4xl"
          >
            <h2 id="recording-settings">Ustawienia nagrywania</h2>
            <p className="my-4">
              {interactionConsent === true
                ? "Zgoda na kliknięcia i nagrywanie jest włączona."
                : "Zgoda na kliknięcia i nagrywanie jest wyłączona."}
              {" Nagrywanie działa na stronie głównej i stronach ofert przed wyborem osoby."}
            </p>
            <Button
              onClick={() => setInteractionConsent(interactionConsent !== true)}
              aria-pressed={interactionConsent === true}
            >
              {interactionConsent === true ? "Wycofaj zgodę" : "Zezwól na nagrywanie"}
            </Button>
          </section>
        )}
      </div>
    </>
  );
  return (
    <div
      className="min-h-dvh bg-background text-foreground"
      data-private-analytics={publicView ? undefined : ""}
      data-public-interaction-capture={captureInteractions ? "" : undefined}
    >
      {interactionAnalyticsConfigured && publicView && interactionConsent === null && (
        <section
          data-private-analytics
          aria-label="Opcjonalne nagrywanie wizyty"
          className="flex flex-wrap items-center justify-center gap-2 border-b px-4 py-2 text-sm"
        >
          <p>Czy możemy zapisać kliknięcia i nagrać sposób korzystania z publicznych stron?</p>
          <Button size="sm" onClick={() => setInteractionConsent(true)}>
            Zezwól
          </Button>
          <Button size="sm" variant="outline" onClick={() => setInteractionConsent(false)}>
            Pomiń
          </Button>
        </section>
      )}
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Przejdź do treści
      </a>
      {workspace ? (
        <div className="app-frame">
          <div className="mobile-header">
            <Link to="/" className="brand">
              <BrandMark />
              DoRoboty.ai
            </Link>
            <Button
              aria-label={menuAt === pathname ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={menuAt === pathname}
              aria-controls="workspace-nav"
              variant="ghost"
              size="icon"
              onClick={() => setMenuAt(menuAt === pathname ? null : pathname)}
            >
              {menuAt === pathname ? <X /> : <Menu />}
            </Button>
          </div>
          <aside
            className={`sidebar ${menuAt === pathname ? "sidebar-open" : ""}`}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMenuAt(null);
            }}
          >
            <Link className="brand" to="/">
              <BrandMark />
              DoRoboty.ai
            </Link>
            <div className="workspace-label">
              <span className="workspace-avatar">{person.name[0]}</span>
              <div>
                <strong>{person.name}</strong>
                <span>{person.headline}</span>
              </div>
            </div>
            <nav id="workspace-nav" aria-label="Panel użytkownika">
              {nav.map(([to, label, Icon]) => (
                <NavLink
                  end={to === "/app"}
                  key={to}
                  to={to}
                  onClick={() => setMenuAt(null)}
                  className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
                >
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/app/settings"
                onClick={() => setMenuAt(null)}
                className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
              >
                <Settings className="size-4" />
                Ustawienia
              </NavLink>
              <Link className="nav-link" to="/oferty">
                Wszystkie oferty
              </Link>
              <Link className="nav-link" to="/auth/sign-in">
                Zmień osobę
              </Link>
            </nav>
          </aside>
          <div className="workspace">
            <div className="topbar">
              <span>
                {person.role === "candidate"
                  ? "Strefa kandydata"
                  : person.role === "employer"
                    ? "Strefa pracodawcy"
                    : "Case study"}
              </span>
              <Link to="/auth/sign-in">{person.name}</Link>
            </div>
            <main id="main" ref={main} tabIndex={-1} className="main-content outline-none">
              {content}
            </main>
          </div>
        </div>
      ) : (
        <>
          <header className="bg-background/95 shadow-[var(--gui-divider-bottom-shadow)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-5 lg:px-8">
              <Link
                className="flex items-center gap-2.5 text-base font-semibold tracking-[var(--gui-tracking-s)]"
                to="/"
                aria-label="DoRoboty.ai — strona główna"
              >
                <BrandMark />
                <span>DoRoboty.ai</span>
              </Link>
              <nav aria-label="Główna nawigacja" className="flex items-center gap-2 sm:gap-5">
                {navigation.map((item) => (
                  <Link
                    key={item.to}
                    className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline"
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                ))}
                {person ? (
                  <div className="flex items-center gap-[var(--gui-space-xs)] sm:gap-[var(--gui-space-m)]">
                    {person.role === "candidate" && (
                      <>
                        <Link
                          className="hidden text-sm font-medium text-muted-foreground md:inline"
                          to="/app/aplikacje"
                        >
                          Aplikacje
                        </Link>
                        <Link
                          className="hidden text-sm font-medium text-muted-foreground md:inline"
                          to="/app/profil"
                        >
                          Profil
                        </Link>
                      </>
                    )}
                    <Link
                      to="/app"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "text-sm font-medium max-sm:min-h-10 max-sm:px-[var(--gui-space-xs)] max-sm:text-sm",
                      )}
                    >
                      Moje konto
                    </Link>
                    <Link
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "hidden md:inline-flex",
                      )}
                      to="/auth/sign-in"
                      aria-label="Zmień osobę"
                      title="Zmień osobę"
                    >
                      <LogOut aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/auth/sign-in?audience=candidate"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "text-sm font-medium max-sm:min-h-10 max-sm:px-[var(--gui-space-xs)] max-sm:text-sm",
                      )}
                    >
                      Wybierz osobę
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>
          <main id="main" ref={main} tabIndex={-1} className="outline-none">
            {content}
          </main>
          <footer className="bg-muted/40 text-foreground shadow-[var(--gui-divider-top-shadow)]">
            <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-12 sm:grid-cols-2 lg:px-8">
              <div>
                <p className="text-base font-semibold">DoRoboty.ai</p>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  Praca dla ludzi, którzy potrafią z AI zbudować coś wartościowego — nie tylko
                  wpisać je do CV.
                </p>
              </div>
              <nav
                aria-label="Stopka"
                className="flex flex-wrap content-start gap-x-6 gap-y-3 text-sm text-muted-foreground sm:justify-end"
              >
                <Link to="/oferty">Oferty</Link>
                <Link to="/metodologia">Metodologia</Link>
                <Link to="/polityka-prywatnosci">Prywatność</Link>
                {interactionAnalyticsConfigured && publicView && interactionConsent !== null && (
                  <button
                    type="button"
                    data-private-analytics
                    onClick={() => setInteractionConsent(interactionConsent ? false : null)}
                  >
                    {interactionConsent ? "Wyłącz nagrywanie" : "Ustawienia nagrywania"}
                  </button>
                )}
                <Link className="inline-flex items-center gap-1" to="/auth/sign-in">
                  Strefa case <ArrowUpRight className="size-4" />
                </Link>
              </nav>
            </div>
            <div className="px-5 py-4 text-xs text-muted-foreground shadow-[var(--gui-divider-top-shadow)] lg:px-8">
              <div className="mx-auto max-w-[1360px]">
                © {new Date().getFullYear()} DoRoboty.ai — od Superhero.tech
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
