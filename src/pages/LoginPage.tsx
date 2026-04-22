import { useState } from "react";
import { Page, User } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  onNavigate: (page: Page) => void;
  onLogin: (user: User) => void;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    onLogin({
      id: "1",
      name: "Utilisateur Test",
      email,
      role: "USER",
    });
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#D4A843' + '08' }}>
      <div className="w-full max-w-md">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 mb-6 transition-colors"
          style={{ color: '#476E55' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#D4A843' }}>
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Connexion</h1>
            <p className="text-slate-600">Accédez à votre espace personnel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-slate-700 font-medium">Adresse email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="pl-10 border-slate-200 text-slate-900 placeholder-slate-400"
                  style={{ backgroundColor: '#476E55', color: 'white' }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700 font-medium">Mot de passe</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 border-slate-200 text-slate-900 placeholder-slate-400"
                  style={{ backgroundColor: '#476E55', color: 'white' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300" style={{ accentColor: '#D4A843' }} />
                <span className="text-sm text-slate-600">Se souvenir de moi</span>
              </label>
              <button type="button" className="text-sm font-medium hover:underline" style={{ color: '#D4A843' }}>
                Mot de passe oublié ?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full text-white border-0 font-medium py-3"
              style={{ backgroundColor: '#D4A843' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c49a3c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4A843'}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Pas encore de compte ?{" "}
              <button
                onClick={() => onNavigate("register")}
                className="font-medium hover:underline"
                style={{ color: '#D4A843' }}
              >
                Créer un compte
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}