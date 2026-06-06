import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Activity, Search, Car, CheckCircle2, Clock, Phone, X, MoreHorizontal, QrCode, Timer,
  LogIn,
  LogOutIcon,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

type Status = 'attendu' | 'garé' | 'sorti';
type Filter = 'tous' | 'attendus' | 'garés' | 'sortis';

interface Res {
  id: number; plaque: string; client: string; tel?: string;
  heure: string; parking_status: Status;
  duree?: string; montant?: number;
}

const API = `${(import.meta as any).env.VITE_API_URL}/api`;
const tok = () => localStorage.getItem('token') ?? '';
const auth = { Authorization: `Bearer ${tok()}`, Accept: 'application/json' };

/* ── Status config ── */
const SC: Record<Status,{dot:string;text:string;bg:string;border:string;label:string}> = {
  attendu: { dot:'bg-amber-400 animate-pulse', text:'text-amber-700', bg:'bg-amber-50', border:'border-amber-200', label:'En attente' },
  garé:    { dot:'bg-blue-500',                text:'text-blue-700',  bg:'bg-blue-50',  border:'border-blue-200',  label:'Garé'      },
  sorti:   { dot:'bg-emerald-500',             text:'text-emerald-700',bg:'bg-emerald-50',border:'border-emerald-200',label:'Sorti'  },
};

/* ── QR Scanner Modal ── */
const QRModal = memo(({ onScan, onClose }: { onScan:(v:string)=>void; onClose:()=>void }) => {
  useEffect(() => {
    const s = new Html5QrcodeScanner('qr-reader', { fps:10, qrbox:{width:220,height:220} }, false);
    s.render(v => { s.clear(); onScan(v); }, () => {});
    return () => { s.clear(); };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><QrCode size={15} className="text-blue-600"/></div>
            <p className="text-[14px] font-semibold text-zinc-900">Scanner un ticket</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors border-none cursor-pointer"><X size={13} className="text-zinc-500"/></button>
        </div>
        <div className="p-5">
          <div id="qr-reader" className="rounded-xl overflow-hidden border border-zinc-200"/>
          <p className="text-center text-[11px] text-zinc-400 mt-3">Centrez le QR code dans le cadre</p>
        </div>
      </div>
    </div>
  );
});

/* ── Reservation Row / Card ── */
const ResRow = memo(({ res, onAction }: { res:Res; onAction:(id:number,a:'check-in'|'check-out')=>void }) => {
  const [busy, setBusy] = useState(false);
  const sc = SC[res.parking_status];

  const act = async (a: 'check-in'|'check-out') => {
    setBusy(true); await onAction(res.id, a); setBusy(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 border-b border-zinc-100 last:border-0 transition-colors min-w-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sc?.bg} ${sc?.border} border`}>
        <Car size={13} className={sc?.text} strokeWidth={2}/>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[13px] font-semibold text-zinc-900 tracking-wider uppercase">{res.plaque}</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-px rounded-md border text-[9px] font-bold tracking-wide ${sc?.bg} ${sc?.border} ${sc?.text}`}>
            <span className={`w-1 h-1 rounded-full shrink-0 ${sc?.dot}`}/>{sc?.label}
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2 truncate">
          <span className="truncate max-w-[120px]">{res.client}</span>
          {res.tel && <span className="flex items-center gap-0.5 shrink-0"><Phone size={9}/>{res.tel}</span>}
        </p>
      </div>

      <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-[12px] text-zinc-500 flex items-center gap-1"><Clock size={9}/>{res.heure}</span>
        {res.duree && <span className="text-[10px] text-zinc-400 flex items-center gap-1"><Timer size={9}/>{res.duree}</span>}
      </div>
      <div className="hidden sm:block text-right shrink-0 min-w-[68px]">
        {res.montant != null
          ? <><p className="text-[13px] font-semibold text-zinc-800">{res.montant.toLocaleString('fr-FR')}</p><p className="text-[9px] text-zinc-400 uppercase tracking-wider">FCFA</p></>
          : <span className="text-zinc-300 text-[12px]">—</span>}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {res.parking_status === 'attendu' && (
          <button disabled={busy} onClick={()=>act('check-in')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-blue-600 text-white text-[11px] font-semibold transition-all disabled:opacity-40 whitespace-nowrap border-none cursor-pointer">
            {busy?<span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"/>:<LogIn size={10} strokeWidth={2.5}/>}
            Entrée
          </button>
        )}
        {res.parking_status === 'garé' && (
          <button disabled={busy} onClick={()=>act('check-out')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold hover:bg-red-100 transition-all disabled:opacity-40 whitespace-nowrap cursor-pointer">
            {busy?<span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"/>:<LogOutIcon size={10} strokeWidth={2.5}/>}
            Sortie
          </button>
        )}
        {res.parking_status === 'sorti' && (
          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-[11px] font-semibold">
            <CheckCircle2 size={10} strokeWidth={2.5}/> OK
          </span>
        )}
        <button className="w-7 h-7 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 transition-colors cursor-pointer">
          <MoreHorizontal size={11}/>
        </button>
      </div>
    </div>
  );
});

/* ══════════════════════════════════ MAIN ══════════════════════════════════ */
export function ParkingFlow() {
  const [data,     setData]    = useState<Res[]>([]);
  const [loading,  setLoading] = useState(true);
  const [filter,   setFilter]  = useState<Filter>('tous');
  const [search,   setSearch]  = useState('');
  const [scanner,  setScanner] = useState(false);

  // Fonction de chargement des données
  const load = useCallback(async (silent=false) => {
    // Émettre le début de chargement vers le Header global pour animer l'icône de rafraîchissement
    window.dispatchEvent(new CustomEvent('bookings-refresh-start'));
    if (!silent) setLoading(true);

    try {
      const r = await fetch(`${API}/partenaire/reservations`, { headers: auth });
      if (r.ok) setData(await r.json());
    } catch(e){ 
      console.error(e); 
    } finally { 
      setLoading(false); 
      // Émettre la fin de chargement vers le Header global
      window.dispatchEvent(new CustomEvent('bookings-refresh-stop'));
    }
  }, []);

  // Déclencheur d'action d'entrée/sortie
  const onAction = useCallback(async (id:number, action:'check-in'|'check-out') => {
    const status = action==='check-in' ? 'garé' : 'sorti';
    try {
      const r = await fetch(`${API}/partenaire/reservations/${id}/status`, {
        method:'PATCH', headers:{...auth,'Content-Type':'application/json'},
        body: JSON.stringify({ parking_status:status }),
      });
      if (r.ok) setData(p => p.map(x => x.id===id ? {...x,parking_status:status as Status} : x));
    } catch(e){ console.error(e); }
  }, []);

  // Logique appelée quand le scanner lit un QR Code avec succès
  const onQR = useCallback((raw:string) => {
    setScanner(false);
    const id = parseInt(raw.replace(/\D/g,''));
    const res = data.find(r => r.id===id);
    if (!res) return;
    onAction(id, res.parking_status==='attendu' ? 'check-in' : 'check-out');
  }, [data, onAction]);

  // ── BRANCHEMENT AVEC LE HEADER GLOBAL ──
  useEffect(() => {
    load(); // Chargement initial au montage de la page

    const handleTriggerRefresh = () => load(true);
    const handleTriggerScanner = () => setScanner(true);

    // Écoute des actions déclenchées depuis les boutons du Header de PartnerLayout
    window.addEventListener('trigger-bookings-refresh', handleTriggerRefresh);
    window.addEventListener('trigger-bookings-scanner', handleTriggerScanner);

    return () => {
      window.removeEventListener('trigger-bookings-refresh', handleTriggerRefresh);
      window.removeEventListener('trigger-bookings-scanner', handleTriggerScanner);
    };
  }, [load]);

  const counts = useMemo(() => ({
    tous:     data.length,
    attendus: data.filter(r=>r.parking_status==='attendu').length,
    garés:    data.filter(r=>r.parking_status==='garé').length,
    sortis:   data.filter(r=>r.parking_status==='sorti').length,
  }), [data]);

  const filtered = useMemo(() => data.filter(r => {
    const fok = filter==='tous'||
      (filter==='attendus'&&r.parking_status==='attendu')||
      (filter==='garés'&&r.parking_status==='garé')||
      (filter==='sortis'&&r.parking_status==='sorti');
    const q = search.toLowerCase();
    return fok && (!q || r.plaque.toLowerCase().includes(q) || r.client.toLowerCase().includes(q));
  }), [data, filter, search]);

  const TABS: {id:Filter;label:string;count:number}[] = [
    {id:'tous',     label:'Tous',       count:counts.tous},
    {id:'attendus', label:'En attente', count:counts.attendus},
    {id:'garés',    label:'Garés',      count:counts.garés},
    {id:'sortis',   label:'Sortis',     count:counts.sortis},
  ];

  const KPIs = [
    {label:'Total', value:counts.tous,    icon:Activity,      color:'text-blue-600',    bg:'bg-blue-50'},
    {label:'Attente',value:counts.attendus,icon:Clock,         color:'text-amber-600',   bg:'bg-amber-50'},
    {label:'Garés', value:counts.garés,   icon:Car,           color:'text-blue-600',    bg:'bg-blue-50'},
    {label:'Sortis',value:counts.sortis,  icon:CheckCircle2,  color:'text-emerald-600', bg:'bg-emerald-50'},
  ];

  return (
    <div className="w-full">
      {/* Affichage du modal de scan contrôlé localement ou par l'événement global */}
      {scanner && <QRModal onScan={onQR} onClose={()=>setScanner(false)}/>}
      
      <div className="flex flex-col gap-4">

        {/* ── KPI strip ── */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {KPIs.map(({label,value,icon:Icon,color,bg})=>(
            <div key={label} className="flex-none bg-white border border-zinc-200 rounded-xl p-3.5 flex items-center gap-3 min-w-[130px]">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={14} className={color} strokeWidth={2}/>
              </div>
              <div>
                <p className="text-[20px] font-bold text-zinc-900 leading-none font-mono">{value}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + filters ── */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Plaque, client…"
              className="w-full h-9 pl-8 pr-8 rounded-lg border border-zinc-200 bg-white text-[13px] text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
            {search && <button onClick={()=>setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 border-none bg-transparent text-zinc-400 hover:text-zinc-600 cursor-pointer"><X size={12}/></button>}
          </div>
          <div className="flex gap-1 bg-white border border-zinc-200 rounded-lg p-1 overflow-x-auto scrollbar-hide">
            {TABS.map(t => (
              <button key={t.id} onClick={()=>setFilter(t.id)}
                className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all border-none cursor-pointer ${
                  filter===t.id ? 'bg-[#e35f1d] text-white' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                }`}>
                {t.label}
                {t.count>0 && <span className={`text-[9px] px-1.5 py-px rounded-full font-bold ${filter===t.id?'bg-white/20 text-white':'bg-zinc-100 text-zinc-500'}`}>{t.count}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── List card ── */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-blue-500"/>
              <p className="text-[13px] font-semibold text-zinc-900">Réservations</p>
              <span className="text-[10px] font-bold text-orange-400 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-full">{filtered.length}</span>
            </div>
            {search && <p className="text-[11px] text-zinc-400">Filtre : <strong className="text-zinc-600">"{search}"</strong></p>}
          </div>

          {/* Rows / Loaders */}
          {loading ? (
            <div className="flex flex-col">
              {[...Array(5)].map((_,i)=>(
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 last:border-0 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 shrink-0"/>
                  <div className="flex-1 flex flex-col gap-2"><div className="h-3 w-28 bg-zinc-100 rounded-full"/><div className="h-2.5 w-20 bg-zinc-100 rounded-full"/></div>
                  <div className="h-6 w-16 bg-zinc-100 rounded-lg"/>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-3">
                <Car size={18} className="text-zinc-300" strokeWidth={1.5}/>
              </div>
              <p className="text-[13px] font-semibold text-zinc-500">{search?'Aucun résultat':'Zone vide'}</p>
              <p className="text-[11px] text-zinc-400 mt-1">{search?"Ajustez vos filtres":"En attente d'entrées…"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {filtered.map(r=><ResRow key={r.id} res={r} onAction={onAction}/>)}
            </div>
          )}

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400"><strong className="text-zinc-600">{filtered.length}</strong> véhicule{filtered.length>1?'s':''}</span>
              <div className="flex items-center gap-4">
                {[{c:'bg-amber-400',l:`${counts.attendus} en approche`},{c:'bg-blue-500',l:`${counts.garés} garés`}].map(({c,l})=>(
                  <div key={l} className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${c}`}/><span className="text-[10px] text-zinc-400">{l}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Action (FAB flottant en bas pour scanner rapidement) ── */}
      <button onClick={()=>setScanner(true)}
        className="sm:hidden fixed bottom-6 right-4 z-30 w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors border-none cursor-pointer">
        <QrCode size={20}/>
      </button>
    </div>
  );
}

export default ParkingFlow;