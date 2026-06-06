import { useState, useEffect, useCallback, memo } from 'react';
import {
  ArrowUpRight, ArrowDownLeft, ShieldCheck, X, Loader2,
  Check, Search, ChevronRight, AlertCircle, Zap, Smartphone,
  TrendingUp, RefreshCw, Download,
} from 'lucide-react';

type TxType   = 'gain' | 'retrait';
type TxStatus = 'completed' | 'pending' | 'failed';
interface Tx    { id: number; type: TxType; label: string; date: string; montant: number; status: TxStatus; parking?: string; methode?: string; }
interface Stats { solde: number; en_attente: number; total_historique: number; total_retraits?: number; transactions?: Tx[]; evolution_revenus?: number[]; }

const METHODS = [
  { key: 'Wave',         emoji: '🌊', color: 'bg-blue-50  border-blue-200  text-blue-700'   },
  { key: 'Orange Money', emoji: '🟠', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { key: 'Free Money',   emoji: '💜', color: 'bg-violet-50 border-violet-200 text-violet-700' },
] as const;

const BADGE: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:   'bg-orange-50  text-orange-700  border-orange-200',
  failed:    'bg-red-50     text-red-700     border-red-200',
};

const STATUS_LABEL: Record<string, string> = { completed: 'Traité', pending: 'En cours', failed: 'Échoué' };

function Sparkline({ data }: { data: number[] }) {
  const pts = data.length >= 2 ? data : [20, 45, 30, 80, 50, 95, 72, 88];
  const W = 200, H = 44, P = 4, max = Math.max(...pts) * 1.1;
  const xs = pts.map((_, i) => P + (i / (pts.length - 1)) * (W - P * 2));
  const ys = pts.map(v => H - P - (v / max) * (H - P * 2));
  const d  = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x} ${ys[i]}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      <defs>
        <linearGradient id="spg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fff" stopOpacity=".2" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${xs.at(-1)} ${H} L${xs[0]} ${H}Z`} fill="url(#spg)" />
      <path d={d} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs.at(-1)} cy={ys.at(-1)} r={3} fill="#fff" />
    </svg>
  );
}

const TxRow = memo(({ tx, last }: { tx: Tx; last: boolean }) => {
  const [open, setOpen] = useState(false);
  const gain = tx.type === 'gain';
  return (
    <div onClick={() => setOpen(v => !v)}
      className={`group flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-blue-50/30 transition-colors ${!last ? 'border-b border-slate-100' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${gain ? 'bg-emerald-50' : 'bg-slate-100'}`}>
        {gain
          ? <ArrowDownLeft size={13} className="text-emerald-600" strokeWidth={2.5} />
          : <ArrowUpRight  size={13} className="text-slate-500"   strokeWidth={2.5} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 truncate">{tx.label}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-400 tabular-nums">{tx.date}</span>
              <span className={`text-[9px] font-bold px-1.5 py-px rounded-md border ${BADGE[tx.status] ?? BADGE.pending}`}>
                {STATUS_LABEL[tx.status] ?? tx.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`font-mono text-[13px] font-bold tabular-nums ${gain ? 'text-emerald-600' : 'text-slate-700'}`}>
              {gain ? '+' : '-'}{Math.abs(tx.montant).toLocaleString('fr-FR')}
              <span className="text-[10px] font-normal text-slate-400 ml-0.5">F</span>
            </span>
            <ChevronRight size={11} className={`text-slate-300 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
          </div>
        </div>
        {open && (
          <div className="mt-2 flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
            {tx.parking && <span>📍 <strong className="text-slate-700">{tx.parking}</strong></span>}
            {tx.methode && <span>💳 <strong className="text-slate-700">{tx.methode}</strong></span>}
            <span className="font-mono text-slate-400 ml-auto">#{String(tx.id).padStart(6, '0')}</span>
          </div>
        )}
      </div>
    </div>
  );
});

function Modal({ solde, onClose, onSuccess }: { solde: number; onClose: () => void; onSuccess: (n: number) => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 'done'>(1);
  const [amt,  setAmt]  = useState('');
  const [meth, setMeth] = useState('Wave');
  const [tel,  setTel]  = useState('');
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');
  const n = parseInt(amt, 10) || 0;

  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/partenaire/retraits`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ montant: amt, methode: meth, numero_compte: tel }),
      });
      if (res.ok) { setStep('done'); setTimeout(() => { onSuccess(n); onClose(); }, 2200); }
      else { const e = await res.json(); setErr(e.message || 'Erreur serveur.'); }
    } catch { setErr('Connexion impossible.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-4" onClick={onClose}>
      <div className="w-full max-w-[400px] bg-white rounded-2xl overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="text-[14px] font-bold text-slate-900">Retrait de fonds</p>
            {step !== 'done' && <p className="text-[11px] text-slate-400 mt-0.5">Étape {step} / 3</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <X size={13} />
          </button>
        </div>

        {/* Progress */}
        {step !== 'done' && (
          <div className="mx-5 mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-700 rounded-full transition-all duration-300" style={{ width: `${(Number(step) / 3) * 100}%` }} />
          </div>
        )}

        <div className="px-5 py-5 flex flex-col gap-4">

          {/* Step 1 — Montant */}
          {step === 1 && <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Montant (FCFA)</label>
              <div className="relative">
                <input type="number" autoFocus value={amt} onChange={e => { setAmt(e.target.value); setErr(''); }}
                  placeholder="0"
                  className="w-full h-13 px-4 pr-16 text-2xl font-bold font-mono rounded-xl border-2 border-slate-200 focus:border-blue-600 outline-none transition-colors bg-slate-50 focus:bg-white py-3" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">FCFA</span>
              </div>
              <div className="flex justify-between text-[11px] px-0.5">
                <span className="text-slate-400">Min. <strong className="text-slate-600">1 000 F</strong></span>
                <span className="text-slate-400">Disponible : <strong className="text-emerald-600">{solde.toLocaleString('fr-FR')} F</strong></span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5000, 10000, 25000, 50000].filter(v => v <= solde).map(v => (
                <button key={v} onClick={() => setAmt(String(v))}
                  className={`py-2 rounded-xl text-[11px] font-bold font-mono border-2 transition-all ${amt === String(v) ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {v / 1000}k
                </button>
              ))}
            </div>
            {err && <p className="flex items-center gap-1.5 text-[12px] text-red-600"><AlertCircle size={12} />{err}</p>}
            <button onClick={() => { if (n < 1000 || n > solde) { setErr('Montant invalide.'); return; } setStep(2); }}
              className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
              Continuer <ChevronRight size={14} />
            </button>
          </>}

          {/* Step 2 — Méthode */}
          {step === 2 && <>
            <div className="flex flex-col gap-2">
              {METHODS.map(m => (
                <button key={m.key} onClick={() => setMeth(m.key)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${meth === m.key ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <span className="text-lg leading-none">{m.emoji}</span>
                  <span className="flex-1 text-[13px] font-semibold text-slate-800">{m.key}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${meth === m.key ? 'border-blue-700 bg-blue-700' : 'border-slate-300'}`}>
                    {meth === m.key && <Check size={9} className="text-white" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Numéro {meth}</label>
              <input type="tel" autoFocus placeholder="7x xxx xx xx" value={tel} onChange={e => setTel(e.target.value)}
                className="w-full py-2.5 px-3.5 font-mono rounded-xl border-2 border-slate-200 focus:border-blue-600 bg-slate-50 focus:bg-white outline-none transition-colors text-[14px] font-semibold" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-colors">Retour</button>
              <button onClick={() => { if (tel.trim()) setStep(3); }} disabled={!tel.trim()}
                className="flex-[2] py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
                Continuer <ChevronRight size={14} />
              </button>
            </div>
          </>}

          {/* Step 3 — Confirmation */}
          {step === 3 && <>
            <div className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
              {([['Montant', `${n.toLocaleString('fr-FR')} FCFA`, true], ['Méthode', meth, false], ['Numéro', tel, false]] as const).map(([l, v, bold], i, a) => (
                <div key={l} className={`flex justify-between px-4 py-3 text-[13px] ${i < a.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <span className="text-slate-400">{l}</span>
                  <span className={bold ? 'font-bold font-mono text-slate-900' : 'font-semibold text-slate-700'}>{v}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-orange-50 border border-orange-100 rounded-xl">
              <AlertCircle size={12} className="text-orange-600 shrink-0" />
              <p className="text-[11px] text-orange-700">Vérifiez le numéro avant de confirmer. Cette action est irréversible.</p>
            </div>
            {err && <p className="flex items-center gap-1.5 text-[12px] text-red-600"><AlertCircle size={12} />{err}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-colors">Retour</button>
              <button onClick={submit} disabled={busy}
                className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
                {busy ? <><Loader2 size={14} className="animate-spin" />Envoi…</> : <><Check size={14} strokeWidth={2.5} />Confirmer</>}
              </button>
            </div>
          </>}

          {/* Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center py-6 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Check size={24} className="text-emerald-600" strokeWidth={2.5} />
              </div>
              <p className="text-[16px] font-bold text-slate-900">Demande envoyée !</p>
              <p className="text-[12px] text-slate-400 max-w-[200px] leading-relaxed">
                <span className="font-bold font-mono text-slate-600">{n.toLocaleString('fr-FR')} F</span> en cours de traitement — délai 24h ouvrées.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Billing() {
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [filter,  setFilter]  = useState<'tous' | 'gains' | 'retraits'>('tous');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/partenaire/billing`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' },
      });
      setStats(await r.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !stats) return (
    <div className="min-h-screen bg-blue-50/40 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={24} className="animate-spin text-blue-700" />
        <p className="text-[13px] text-slate-400">Chargement du portefeuille…</p>
      </div>
    </div>
  );

  const txs = (stats.transactions ?? []).filter(t => {
    const ok = filter === 'tous' || (filter === 'gains' ? t.type === 'gain' : t.type === 'retrait');
    const q  = search.toLowerCase();
    return ok && (!q || t.label.toLowerCase().includes(q) || t.parking?.toLowerCase().includes(q));
  });
  const totalIn  = stats.total_historique ?? 0;
  const totalOut = stats.total_retraits   ?? 0;
  const ratio    = totalIn > 0 ? Math.min(100, (totalIn / (totalIn + totalOut)) * 100) : 0;

  return (
    <div className="min-h-screen bg-blue-50/40 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-5">

        {/* Hero balance card */}
        <div className="bg-blue-900 rounded-xl overflow-hidden">
          <div className="px-5 sm:px-6 pt-5 pb-4 grid grid-cols-1 sm:grid-cols-[1fr_1px_1fr_1px_1fr] gap-4 items-center">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Solde retirable</p>
              <p className="text-[32px] font-bold text-white font-mono leading-none tracking-tight">
                {stats.solde.toLocaleString('fr-FR')}
                <span className="text-[14px] font-medium text-white/40 ml-2">FCFA</span>
              </p>
              <span className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <TrendingUp size={9} strokeWidth={3} /> +8.4% ce mois
              </span>
            </div>
            <div className="hidden sm:block h-14 bg-white/10" />
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">En attente</p>
                <p className="text-[17px] font-bold text-orange-400 font-mono">
                  {stats.en_attente.toLocaleString('fr-FR')} <span className="text-[11px] text-white/30">FCFA</span>
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Total encaissé</p>
                <p className="text-[17px] font-bold text-white font-mono">
                  {stats.total_historique.toLocaleString('fr-FR')} <span className="text-[11px] text-white/30">FCFA</span>
                </p>
              </div>
            </div>
            <div className="hidden sm:block h-14 bg-white/10" />
            <div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2">Évolution — 8 mois</p>
              <Sparkline data={stats.evolution_revenus ?? []} />
            </div>
          </div>
          <div className="border-t border-white/10 px-5 sm:px-6 py-3 flex items-center gap-3">
            <button onClick={() => setModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[12px] font-semibold transition-colors border border-white/10">
              <ArrowUpRight size={12} className="text-orange-400" /> Retirer des fonds
            </button>
            <span className="text-[11px] text-white/30 flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-emerald-400" /> Transactions sécurisées SSL
            </span>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_248px] gap-5 items-start">

          {/* Transactions */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 rounded-full bg-blue-700" />
                <span className="text-[13px] font-bold text-slate-800">Transactions</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">{txs.length}</span>
              </div>
              <div className="flex bg-slate-100 p-0.5 rounded-xl gap-px">
                {(['tous', 'gains', 'retraits'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-[10px] text-[11px] font-semibold transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    {f === 'tous' ? 'Tous' : f === 'gains' ? 'Entrées' : 'Retraits'}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-2.5 border-b border-slate-100">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
                  className="w-full h-8 pl-8 pr-3 text-[12px] rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-blue-400 transition-colors" />
                {search && <X onClick={() => setSearch('')} size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" />}
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {txs.length > 0
                ? txs.map((tx, i) => <TxRow key={tx.id} tx={tx} last={i === txs.length - 1} />)
                : (
                  <div className="flex flex-col items-center justify-center py-14 gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Zap size={18} className="text-slate-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-[13px] font-semibold text-slate-500">Aucune transaction</p>
                    <p className="text-[11px] text-slate-400">Vos revenus apparaîtront ici.</p>
                  </div>
                )}
            </div>

            {txs.length > 0 && (
              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400"><strong className="text-slate-600">{txs.length}</strong> résultat{txs.length > 1 ? 's' : ''}</span>
                <div className="flex items-center gap-3">
                  {[['bg-emerald-500', 'Entrées'], ['bg-slate-400', 'Retraits']].map(([c, l]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${c}`} />
                      <span className="text-[10px] text-slate-400">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">

            {/* Cash flow */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Flux de trésorerie</p>
              <div className="flex justify-between mb-2 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-emerald-600"><ArrowDownLeft size={10} strokeWidth={3} />{totalIn.toLocaleString('fr-FR')} F</span>
                <span className="flex items-center gap-1 text-slate-500">{totalOut.toLocaleString('fr-FR')} F<ArrowUpRight size={10} strokeWidth={3} /></span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-700 rounded-full transition-all duration-700" style={{ width: `${ratio}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                <span>Entrées {Math.round(ratio)}%</span>
                <span>Retraits {Math.round(100 - ratio)}%</span>
              </div>
              <div className="mt-4 flex gap-1 items-end h-10">
                {(stats.evolution_revenus ?? [20, 45, 30, 80, 50, 95, 72, 88]).map((v, i, a) => (
                  <div key={i} className={`flex-1 rounded-sm transition-all ${i === a.length - 1 ? 'bg-blue-700' : 'bg-slate-200'}`}
                    style={{ height: `${(v / Math.max(...a)) * 100}%` }} />
                ))}
              </div>
            </div>

            {/* Compte de versement */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Compte de versement</p>
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center shrink-0">
                  <Smartphone size={14} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900">Wave Sénégal</p>
                  <p className="text-[10px] text-blue-700 mt-0.5">Compte par défaut</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check size={10} className="text-emerald-600" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="bg-blue-900 border border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={13} className="text-emerald-400" strokeWidth={2.5} />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Sécurité</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">Transactions chiffrées SSL · Vérification 24h · Données protégées</p>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <Modal solde={stats.solde} onClose={() => setModal(false)}
          onSuccess={n => { setStats(p => p ? { ...p, solde: p.solde - n, en_attente: p.en_attente + n } : p); load(); }} />
      )}
    </div>
  );
}

export default Billing;