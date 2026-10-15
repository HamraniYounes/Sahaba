import { useCallback, useEffect, useMemo, useState } from "react";
import { FormMessage } from "../../components/AuthCard";
import { Input } from "../../components/ui/input";
import { fetchUsers, setUserRole } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { AdminUser, Role } from "../../types";

export function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(() => { fetchUsers().then(setUsers).catch((e: Error) => setError(e.message)); }, []);
  useEffect(() => { load(); }, [load]);
  const rows = useMemo(() => { const t = q.trim().toLowerCase(); return users.filter((u) => !t || `${u.name} ${u.email}`.toLowerCase().includes(t)); }, [users, q]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Utilisateurs <span className="text-base font-normal text-slate-500">({rows.length})</span></h1>
      <Input className="mb-4 max-w-sm" placeholder="Rechercher (nom, email)…" value={q} onChange={(e) => setQ(e.target.value)} />
      <FormMessage error={error} />
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr><th className="text-left px-3 py-2 font-medium">Nom</th><th className="text-left px-3 py-2 font-medium">Email</th><th className="text-left px-3 py-2 font-medium">Inscrit le</th><th className="text-left px-3 py-2 font-medium">Rôle</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{rows.map((u) => (
            <tr key={u.id}>
              <td className="px-3 py-2">{u.name || "—"}</td><td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString("fr-BE")}</td>
              <td className="px-3 py-2">
                <select value={u.role} disabled={u.id === user?.id} onChange={async (e) => { try { await setUserRole(u.id, e.target.value as Role); load(); } catch (err) { setError((err as Error).message); } }}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1">
                  <option value="USER">Utilisateur</option><option value="OWNER">Propriétaire</option><option value="MODERATOR">Modérateur</option><option value="ADMIN">Admin</option></select>
              </td>
            </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
