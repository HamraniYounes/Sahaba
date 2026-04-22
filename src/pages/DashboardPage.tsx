import { Page, User } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, User as UserIcon, Mail, Shield, MapPin, Heart, Clock, Edit, Camera } from "lucide-react";

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
  user: User | null;
}

export function DashboardPage({ onNavigate, user }: DashboardPageProps) {
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 mb-4">Vous devez être connecté pour accéder à cette page.</p>
        <Button
          onClick={() => onNavigate("login")}
          className="text-white border-0"
          style={{ backgroundColor: '#D4A843' }}
        >
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-2 mb-6 transition-colors"
        style={{ color: '#476E55' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D4A843' + '20' }}>
                  <UserIcon className="w-10 h-10" style={{ color: '#D4A843' }} />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: '#476E55' }}>
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 text-sm">{user.email}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Shield className="w-4 h-4" style={{ color: '#D4A843' }} />
                <span className="text-sm font-medium" style={{ color: '#D4A843' }}>Membre vérifié</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4A843' + '15' }}>
                    <MapPin className="w-5 h-5" style={{ color: '#D4A843' }} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Lieux proposés</p>
                    <p className="text-lg font-semibold text-slate-900">12</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#476E55' + '15' }}>
                    <Heart className="w-5 h-5" style={{ color: '#476E55' }} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Favoris</p>
                    <p className="text-lg font-semibold text-slate-900">28</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4A843' + '15' }}>
                    <Clock className="w-5 h-5" style={{ color: '#D4A843' }} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Dernière connexion</p>
                    <p className="text-sm font-medium text-slate-900">Aujourd'hui</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Informations personnelles</h3>
              <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 bg-white">
                <Edit className="w-4 h-4" />
                Modifier
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-700 font-medium">Nom complet</Label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    value={user.name}
                    className="pl-10 border-slate-200 text-slate-900"
                    style={{ backgroundColor: '#476E55', color: 'white' }}
                    readOnly
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
                    value={user.email}
                    className="pl-10 border-slate-200 text-slate-900"
                    style={{ backgroundColor: '#476E55', color: 'white' }}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Activité récente</h3>
            <div className="space-y-3">
              {[
                { action: "Avis publié", location: "Restaurant Al Mounia", date: "Il y a 2 heures" },
                { action: "Lieu ajouté aux favoris", location: "Mosquée Al Ghassani", date: "Hier" },
                { action: "Lieu proposé", location: "Boucherie Medina", date: "Il y a 3 jours" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4A843' + '15' }}>
                    <Clock className="w-5 h-5" style={{ color: '#D4A843' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.location}</p>
                  </div>
                  <span className="text-xs text-slate-400">{activity.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Badges obtenus</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#D4A843' }}>
                <Shield className="w-4 h-4" />
                Contributeur actif
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#476E55' }}>
                <MapPin className="w-4 h-4" />
                Explorateur
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 bg-slate-100">
                <Heart className="w-4 h-4" />
                5 avis publiés
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}