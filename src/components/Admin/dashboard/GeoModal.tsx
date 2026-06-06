import { useState, useEffect, memo } from "react";
import {
  MapPin, X, CheckCircle2, RefreshCw, AlertTriangle,
  ExternalLink, Building2, Users, Car, Clock, Shield,
  FileText, Phone, Mail, Star, ChevronRight, Info,
} from "lucide-react";

/* ── Types ── */
interface Coords { latitude: string; longitude: string; }

interface ParkingDetail {
  id: number;
  nom: string;
  quartier?: string;
  departement?: string;
  description?: string;
  capacite?: number;
  tarif_horaire?: number;
  tarif_journalier?: number;
  services?: string[];
  latitude?: string;
  longitude?: string;
  
  user?: {
    name: string;
    email: string;
    telephone: string;
    nb_parkings?: number;
  };
  // Stats
  created_at?: string;
  photos?: string[];
  statut?: string;
  plans?: any[];

}

/* ── Helpers ── */
const isValidLat = (v: string) => { const n = parseFloat(v); return !isNaN(n) && n >= -90 && n <= 90; };
const isValidLng = (v: string) => { const n = parseFloat(v); return !isNaN(n) && n >= -180 && n <= 180; };

/* ── Info row ── */
function InfoRow({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-[12px] text-slate-400 font-medium w-28 shrink-0">{label}</span>
      <span className={`text-[13px] font-semibold flex-1 truncate ${accent ? 'text-[#1B3FA0]' : 'text-slate-800'}`}>{value || '—'}</span>
    </div>
  );
}

/* ── Service badge ── */
function ServiceBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[11px] font-semibold text-blue-700">
      <CheckCircle2 size={9} strokeWidth={3} /> {label}
    </span>
  );
}

/* ── Coord field ── */
function CoordField({ label, value, placeholder, error, onChange }: {
  label: string; value: string; placeholder: string;
  error?: string; onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <input
        type="text" value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`h-11 px-3 rounded-xl border-2 font-mono text-[13px] font-semibold outline-none transition-all bg-slate-50 focus:bg-white
          ${error ? 'border-red-400' : focused ? 'border-[#1B3FA0]' : 'border-slate-200'}`}
        style={{ boxShadow: focused ? '0 0 0 4px rgba(27,63,160,.08)' : 'none' }}
      />
      {error && <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium"><AlertTriangle size={10}/>{error}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GEOMODAL — Panneau complet d'approbation parking
══════════════════════════════════════════════════════ */
export const GeoModal = memo(({ parking, onClose, onConfirm }: {
  parking: ParkingDetail | null;
  onClose: () => void;
  onConfirm: (c: Coords) => Promise<void>;
}) => {
  const [coords,    setCoords]    = useState<Coords>({ latitude: '', longitude: '' });
  const [errors,    setErrors]    = useState<Partial<Coords>>({});
  const [loading,   setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [tab,       setTab]       = useState<'info' | 'coords'>('info');

  useEffect(() => {
    if (parking) {
      setCoords({
        latitude:  parking.latitude  ? String(parking.latitude)  : '',
        longitude: parking.longitude ? String(parking.longitude) : '',
      });
      setErrors({});
      setConfirmed(false);
      setTab('info');
    }
  }, [parking]);

  if (!parking) return null;

  const validate = () => {
    const errs: Partial<Coords> = {};
    if (!coords.latitude.trim())          errs.latitude  = 'Requis';
    else if (!isValidLat(coords.latitude)) errs.latitude  = 'Entre -90 et 90';
    if (!coords.longitude.trim())          errs.longitude = 'Requis';
    else if (!isValidLng(coords.longitude))errs.longitude = 'Entre -180 et 180';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async () => {
    if (tab === 'info') { setTab('coords'); return; }
    if (!validate()) return;
    if (!confirmed) { setConfirmed(true); return; }
    setLoading(true);
    try { await onConfirm(coords); }
    catch { setConfirmed(false); }
    finally { setLoading(false); }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${parking.nom} ${parking.quartier ?? ''} Dakar Senegal`)}`;
  const coordsReady = coords.latitude && coords.longitude && !errors.latitude && !errors.longitude;

  const initials = parking.user?.name?.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() ?? '??';
 
  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: 580, maxHeight: '92vh', animation: 'gm-in .25s cubic-bezier(.16,1,.3,1) both' }}>
        <style>{`@keyframes gm-in{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}`}</style>

        {/* ── Tab bar ── */}
        <div className="flex px-6 pt-3 gap-1 shrink-0">
          {([['info','Informations'], ['coords','Coordonnées GPS']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                tab === key
                  ? 'bg-[#1B3FA0] text-white border-[#1B3FA0] shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}>
              {key === 'info' ? <Info size={12}/> : <MapPin size={12}/>}
              {label}
              {key === 'coords' && coordsReady && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
              )}
            </button>
          ))}
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* ── TAB INFO ── */}
          {tab === 'info' && (
            <div className="flex flex-col gap-4">

              {/* Propriétaire */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Propriétaire</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-[12px] text-[#1B3FA0] shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-800">{parking.user?.name ?? '—'}</p>
                    {parking.user?.nb_parkings !== undefined && (
                      <p className="text-[11px] text-slate-400">{parking.user.nb_parkings} parking(s) déjà validé(s)</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-0 divide-y divide-slate-100">
                  <InfoRow icon={<Mail size={11} className="text-slate-400"/>}    label="Email"     value={parking.user?.email     ?? '—'} />
                  <InfoRow icon={<Phone size={11} className="text-slate-400"/>}   label="Téléphone" value={parking.user?.telephone  ?? '—'} />
                </div>
              </div>

              {/* Détails parking */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Détails de l'espace</p>
                <div className="flex flex-col gap-0 divide-y divide-slate-100">
                  <InfoRow icon={<Building2 size={11} className="text-slate-400"/>} label="Nom"         value={parking.nom}             accent />
                  <InfoRow icon={<MapPin size={11} className="text-slate-400"/>}    label="Quartier"    value={parking.quartier  ?? '—'} />
                  <InfoRow icon={<MapPin size={11} className="text-slate-400"/>}    label="Département" value={parking.departement ?? '—'} />
                  <InfoRow icon={<Car size={11} className="text-slate-400"/>}       label="Capacité"    value={parking.capacite ? `${parking.capacite} places` : '—'} />
                  <InfoRow icon={<Clock size={11} className="text-slate-400"/>}     label="Tarif/heure" value={parking.plans &&   parking.plans[0]?.prix ? `${parking.plans[0].prix.toLocaleString('fr-FR')} FCFA` : '—'} />
                  <InfoRow icon={<FileText size={11} className="text-slate-400"/>}  label="Soumis le"   value={parking.created_at ?? '—'} />
                </div>
              </div>

              {/* Description */}
              {parking.description && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{parking.description}</p>
                </div>
              )}

              {/* Services */}
              {parking.services && parking.services.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Services proposés</p>
                  <div className="flex flex-wrap gap-2">
                    {parking.services.map((s, i) => <ServiceBadge key={i} label={s}/>)}
                  </div>
                </div>
              )}

              {/* Photos */}
              {parking.photos && parking.photos.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Photos ({parking.photos.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {parking.photos.slice(0,6).map((url, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover"/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB COORDS ── */}
          {tab === 'coords' && (
            <div className="flex flex-col gap-4">

              {/* Coords existantes */}
              {(parking.latitude || parking.longitude) && (
                <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
                  <Info size={14} className="text-blue-600 shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-[12px] font-semibold text-blue-700 mb-1">Coordonnées soumises par le propriétaire</p>
                    <p className="text-[11px] text-blue-600 font-mono">
                      {parking.latitude}, {parking.longitude}
                    </p>
                  </div>
                </div>
              )}

              {/* Fields */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5">Valider / Corriger les coordonnées</p>
                <div className="grid grid-cols-2 gap-3">
                  <CoordField
                    label="Latitude"  value={coords.latitude}  placeholder="ex: 14.7123" error={errors.latitude}
                    onChange={v => { setCoords(c=>({...c,latitude:v})); setErrors(e=>({...e,latitude:undefined})); setConfirmed(false); }}
                  />
                  <CoordField
                    label="Longitude" value={coords.longitude} placeholder="ex: -17.4456" error={errors.longitude}
                    onChange={v => { setCoords(c=>({...c,longitude:v})); setErrors(e=>({...e,longitude:undefined})); setConfirmed(false); }}
                  />
                </div>
              </div>

              {/* Maps link */}
              <a href={mapsUrl} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-[13px] font-semibold text-[#1B3FA0] hover:bg-blue-100 transition-colors no-underline">
                <ExternalLink size={14}/> Vérifier sur Google Maps
              </a>

              {/* Confirmation warning */}
              {confirmed && !loading && (
                <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5"/>
                  <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
                    Cette action rendra le parking <strong>{parking.nom}</strong> visible par tous les clients. Confirmez-vous l'approbation ?
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-3 shrink-0">
          <button onClick={onClose}
            className="flex-1 h-11 rounded-xl border-2 border-slate-200 bg-white text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-colors">
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || (tab === 'coords' && !coords.latitude && !coords.longitude)}
            className="flex-[2] h-11 rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: loading ? '#94A3B8' : confirmed ? '#10B981' : '#1B3FA0',
              boxShadow: loading ? 'none' : `0 4px 14px ${confirmed ? 'rgba(16,185,129,.3)' : 'rgba(27,63,160,.3)'}`,
            }}>
            {loading ? (
              <><RefreshCw size={15} className="animate-spin"/> Traitement…</>
            ) : confirmed ? (
              <><CheckCircle2 size={15}/> Confirmer l'approbation</>
            ) : tab === 'info' ? (
              <>Passer aux coordonnées <ChevronRight size={15}/></>
            ) : (
              <><MapPin size={15}/> Valider les coordonnées</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default GeoModal;