import { useState } from "react";
import { Page, User } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, Mail, Lock, User as UserIcon, Eye, EyeOff, Check } from "lucide-react";

interface RegisterPageProps {
  onNavigate: (page: Page) => void;
  onLogin: (user: User) => void;
}

export function RegisterPage({ onNavigate, onLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (!formData.acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation");
      return;
    }
    onLogin({
      id: "1",
      name: formData.name,
      email: formData.email,
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Créer un compte</h1>
            <p className="text-slate-600">Rejoignez la communauté SAHABA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-700 font-medium">Nom complet</Label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Votre nom"
                  className="pl-10 border-slate-200 text-slate-900 placeholder-slate-400"
                  style={{ backgroundColor: '#476E55', color: 'white' }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-700 font-medium">Adresse email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <div>
              <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirmer le mot de passe</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10 border-slate-200 text-slate-900 placeholder-slate-400"
                  style={{ backgroundColor: '#476E55', color: 'white' }}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 mt-0.5"
                style={{ accentColor: '#D4A843' }}
              />
              <span className="text-sm text-slate-600">
                J'accepte les{" "}
                <button type="button" onClick={() => onNavigate("legal")} className="font-medium hover:underline" style={{ color: '#D4A843' }}>
                  conditions d'utilisation
                </button>{" "}
                et la{" "}
                <button type="button" onClick={() => onNavigate("legal")} className="font-medium hover:underline" style={{ color: '#D4A843' }}>
                  politique de confidentialité
                </button>
              </span>
            </label>

            <Button
              type="submit"
              className="w-full text-white border-0 font-medium py-3"
              style={{ backgroundColor: '#D4A843' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c49a3c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4A843'}
            >
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Déjà un compte ?{" "}
              <button
                onClick={() => onNavigate("login")}
                className="font-medium hover:underline"
                style={{ color: '#D4A843' }}
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}