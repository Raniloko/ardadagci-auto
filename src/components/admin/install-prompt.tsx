import { CheckCircle2, MoreHorizontal, Share, SquarePlus, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useToast } from "./ui";

/** Chrome/Edge/Samsung "beforeinstallprompt" event (not in the DOM typings). */
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type InstallWindow = Window & { __admInstall?: InstallPromptEvent | null };

/** Captures the install event before React has loaded (inlined into the /admin <head>). */
export const INSTALL_CAPTURE_SCRIPT =
  "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__admInstall=e;window.dispatchEvent(new Event('adm-installable'));});";

/** prompt: one-tap install (Android, Chrome, Edge) · ios: Share → Home Screen · manual: browser menu · none: installed/unsupported */
type Mode = "prompt" | "ios" | "manual" | "none";
type InstallState = { mode: Mode; installed: boolean; open: () => void };

const InstallContext = createContext<InstallState>({ mode: "none", installed: false, open: () => undefined });
export const useInstall = () => useContext(InstallContext);

const DISMISS_KEY = "ardadagci-admin-install-dismissed";
const DISMISS_DAYS = 3;

const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isMobile = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return Boolean(at) && Date.now() - at < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

/** Offers the dashboard as an installed app: a native-style sheet that appears on its own once per few days. */
export function InstallProvider({ children, autoShow }: { children: ReactNode; autoShow: boolean }) {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>("none");
  const [installed, setInstalled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const win = window as InstallWindow;
    const takeEvent = () => {
      if (!win.__admInstall) return;
      setDeferred(win.__admInstall);
      setMode("prompt");
    };
    takeEvent();
    window.addEventListener("adm-installable", takeEvent);
    const onInstalled = () => {
      win.__admInstall = null;
      setInstalled(true);
      setVisible(false);
      setMode("none");
    };
    window.addEventListener("appinstalled", onInstalled);
    // Browsers without the install event: Safari on iOS uses the share sheet, others their own menu.
    const fallback = window.setTimeout(() => {
      if (win.__admInstall) return;
      if (isIos()) setMode("ios");
      else if (isMobile()) setMode("manual");
    }, 2500);
    return () => {
      window.removeEventListener("adm-installable", takeEvent);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(fallback);
    };
  }, []);

  // Appear by itself shortly after the page settles, unless dismissed recently.
  useEffect(() => {
    if (!autoShow || installed || mode === "none" || recentlyDismissed()) return;
    const id = window.setTimeout(() => setVisible(true), mode === "prompt" ? 1200 : 600);
    return () => window.clearTimeout(id);
  }, [autoShow, installed, mode]);

  const close = useCallback(() => {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* storage blocked */ }
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice.catch(() => ({ outcome: "dismissed" as const }));
    (window as InstallWindow).__admInstall = null;
    setDeferred(null);
    setVisible(false);
    close();
    if (choice.outcome === "accepted") {
      toast("App wird installiert – du findest sie gleich auf deinem Startbildschirm");
      setMode("none");
    } else {
      setMode(isMobile() ? "manual" : "none");
    }
  }

  const value: InstallState = { mode, installed, open: () => setVisible(true) };
  return (
    <InstallContext.Provider value={value}>
      {children}
      {visible && mode !== "none" && <InstallSheet mode={mode} onInstall={install} onClose={close} />}
    </InstallContext.Provider>
  );
}

function InstallSheet({ mode, onInstall, onClose }: { mode: Exclude<Mode, "none">; onInstall: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="adm-sheet-backdrop" onClick={onClose}>
      <div className="adm-sheet" role="dialog" aria-modal="true" aria-labelledby="adm-install-title" onClick={(e) => e.stopPropagation()}>
        <span className="adm-sheet-handle" aria-hidden />
        <button type="button" className="adm-sheet-close" onClick={onClose} aria-label="Schließen"><X /></button>
        <div className="adm-install-app">
          <img src="/admin-icon-192.png" alt="" width={64} height={64} />
          <div><strong id="adm-install-title">ARDADAGCI Admin</strong><span>www.ardadagci.com</span></div>
        </div>
        {mode === "prompt" && (
          <>
            <p className="adm-install-lead">Installiere das Dashboard als App auf deinem Startbildschirm.</p>
            <ul className="adm-install-points">
              <li><CheckCircle2 />Startet im Vollbild wie eine echte App</li>
              <li><CheckCircle2 />Eigenes Symbol – ein Tipp, und du bist drin</li>
              <li><CheckCircle2 />Kein App Store nötig, braucht kaum Speicher</li>
            </ul>
            <button type="button" className="adm-btn block" onClick={onInstall}>Installieren</button>
            <button type="button" className="adm-btn soft block adm-sheet-later" onClick={onClose}>Später</button>
          </>
        )}
        {mode === "ios" && (
          <>
            <p className="adm-install-lead">Lege das Dashboard in drei Schritten als App auf deinen Home-Bildschirm.</p>
            <ol className="adm-install-steps">
              <li><span className="adm-step-no">1</span><span>Tippe in Safari auf <b>Teilen</b> <Share className="adm-step-icon" /> – bei neueren iPhones zuerst auf <MoreHorizontal className="adm-step-icon" /></span></li>
              <li><span className="adm-step-no">2</span><span>Wähle <b>Zum Home-Bildschirm</b> <SquarePlus className="adm-step-icon" /> (ggf. nach unten scrollen)</span></li>
              <li><span className="adm-step-no">3</span><span>Tippe oben rechts auf <b>Hinzufügen</b></span></li>
            </ol>
            <button type="button" className="adm-btn block" onClick={onClose}>Verstanden</button>
          </>
        )}
        {mode === "manual" && (
          <>
            <p className="adm-install-lead">Lege das Dashboard als App auf deinen Startbildschirm.</p>
            <ol className="adm-install-steps">
              <li><span className="adm-step-no">1</span><span>Öffne das Browser-Menü <b>⋮</b> oben rechts</span></li>
              <li><span className="adm-step-no">2</span><span>Tippe auf <b>App installieren</b> bzw. <b>Zum Startbildschirm hinzufügen</b></span></li>
              <li><span className="adm-step-no">3</span><span>Mit <b>Installieren</b> bestätigen</span></li>
            </ol>
            <button type="button" className="adm-btn block" onClick={onClose}>Verstanden</button>
          </>
        )}
      </div>
    </div>
  );
}
