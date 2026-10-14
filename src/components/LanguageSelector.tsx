import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

/** 33 langues européennes, traduites via le widget Google Translate (choix mémorisé par cookie). */
export const LANGUAGES: { code: string; label: string }[] = [
  { code: "fr", label: "Français" }, { code: "en", label: "English" }, { code: "nl", label: "Nederlands" },
  { code: "de", label: "Deutsch" }, { code: "es", label: "Español" }, { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" }, { code: "pl", label: "Polski" }, { code: "ro", label: "Română" },
  { code: "el", label: "Ελληνικά" }, { code: "cs", label: "Čeština" }, { code: "sv", label: "Svenska" },
  { code: "hu", label: "Magyar" }, { code: "da", label: "Dansk" }, { code: "fi", label: "Suomi" },
  { code: "sk", label: "Slovenčina" }, { code: "bg", label: "Български" }, { code: "hr", label: "Hrvatski" },
  { code: "lt", label: "Lietuvių" }, { code: "lv", label: "Latviešu" }, { code: "sl", label: "Slovenščina" },
  { code: "et", label: "Eesti" }, { code: "ga", label: "Gaeilge" }, { code: "mt", label: "Malti" },
  { code: "no", label: "Norsk" }, { code: "tr", label: "Türkçe" }, { code: "sq", label: "Shqip" },
  { code: "bs", label: "Bosanski" }, { code: "sr", label: "Српски" }, { code: "uk", label: "Українська" },
  { code: "ru", label: "Русский" }, { code: "ca", label: "Català" }, { code: "is", label: "Íslenska" },
];

function currentLang(): string {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "fr";
}

function setCookie(value: string) {
  const host = window.location.hostname;
  document.cookie = `googtrans=${value}; path=/; max-age=31536000`;
  document.cookie = `googtrans=${value}; path=/; domain=${host}; max-age=31536000`;
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate: { TranslateElement: new (o: object, id: string) => unknown } };
  }
}

export function LanguageSelector() {
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    const l = currentLang();
    setLang(l);
    if (l === "fr" || document.getElementById("gt-script")) return;
    window.googleTranslateElementInit = () => {
      new window.google!.translate.TranslateElement({ pageLanguage: "fr", autoDisplay: false }, "google_translate_element");
    };
    const s = document.createElement("script");
    s.id = "gt-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const change = (code: string) => {
    setLang(code);
    if (code === "fr") {
      setCookie("/fr/fr");
      document.cookie = "googtrans=; path=/; max-age=0";
    } else setCookie(`/fr/${code}`);
    window.location.reload();
  };

  return (
    <label className="flex items-center gap-1 text-slate-600 notranslate" title="Langue">
      <Globe className="w-4 h-4" />
      <select value={lang} onChange={(e) => change(e.target.value)} aria-label="Langue"
        className="bg-transparent text-sm py-1 pr-1 focus:outline-none cursor-pointer max-w-[7.5rem]">
        {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </label>
  );
}
