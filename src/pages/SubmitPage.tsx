import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { LocationForm } from "../components/LocationForm";
import { submitLocation } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function SubmitPage() {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  if (!user) return null;

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="w-12 h-12 text-forest mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Merci !</h1>
        <p className="text-slate-600 mb-6">Votre proposition sera publiée après vérification par notre équipe.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/profile"><Button>Voir mes propositions</Button></Link>
          <Button variant="outline" onClick={() => setDone(false)}>Proposer un autre lieu</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-1">Proposer un lieu</h1>
      <p className="text-slate-600 mb-6">Aidez la communauté en ajoutant un lieu. L'adresse est géolocalisée automatiquement.</p>
      <LocationForm userId={user.id} submitLabel="Envoyer la proposition" onSubmit={async (input) => { await submitLocation(input, user.id); setDone(true); }} />
    </div>
  );
}
