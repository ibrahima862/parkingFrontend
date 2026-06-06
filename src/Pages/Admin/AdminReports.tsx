import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, CheckCircle, XCircle, Clock,
  ExternalLink, Trash2, MapPin, RefreshCw, Flag,
} from 'lucide-react';
import { Report } from '../../type';

const PAGE_SIZE = 8;

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  en_attente: { label: 'En attente', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  resolu:     { label: 'Traité',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejete:     { label: 'Rejeté',     cls: 'bg-red-50 text-red-700 border-red-200' },
};

const FILTERS = [
  { k: 'en_attente', l: 'En attente', active: 'bg-orange-500 border-orange-500 text-white' },
  { k: 'resolu',     l: 'Traités',    active: 'bg-blue-700  border-blue-700  text-white'   },
  { k: 'rejete',     l: 'Rejetés',    active: 'bg-red-600   border-red-600   text-white'   },
];

function Pagination({ page, totalPages, total, onPage }: {
  page: number; totalPages: number; total: number; onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to   = Math.min(page * PAGE_SIZE, total);
  const pages: (number | '…')[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(1);
  if (page > 3) pages.push('…');
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
  if (page < totalPages - 2) pages.push('…');
  if (totalPages > 1) add(totalPages);

  return (
    <div className="flex items-center justify-between gap-4 mt-4">
      <p className="text-[11px] text-slate-400">
        <span className="font-semibold text-slate-600">{from}–{to}</span> sur{' '}
        <span className="font-semibold text-slate-600">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        {pages.map((p, i) => p === '…' ? (
          <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-[11px] text-slate-400">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p as number)}
            className={`w-8 h-8 rounded-lg text-[11px] font-bold border transition-colors ${
              page === p ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
            }`}>{p}</button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}

function ReportCard({ report, onAction }: { report: Report; onAction: (id: number, action: string) => void }) {
  const sCfg = STATUS_CFG[report.status] ?? STATUS_CFG.en_attente;
  const isPending = report.status === 'en_attente';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-100 hover:shadow-[0_2px_12px_rgba(29,78,216,0.06)] transition-all group">
      {/* Top accent */}
      <div className={`h-[2.5px] w-full ${isPending ? 'bg-orange-500' : report.status === 'traite' ? 'bg-emerald-500' : 'bg-red-400'}`} />

      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">

          {/* Left */}
          <div className="flex-1 min-w-0">

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${sCfg.cls}`}>
                {report.category}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${sCfg.cls}`}>
                {sCfg.label}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Clock size={11} />
                {new Date(report.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Parking */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-blue-700" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-bold text-slate-900 truncate">
                    {report.parking?.nom || 'Parking inconnu'}
                  </p>
                  <a href={`/parking/${report.parking_id}`} target="_blank" rel="noreferrer"
                    className="text-slate-300 hover:text-blue-600 transition-colors shrink-0">
                    <ExternalLink size={13} />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{report.parking?.adresse || 'Adresse non renseignée'}</p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 relative mb-3">
              <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message client</span>
              <p className="text-[12px] text-slate-600 leading-relaxed italic">"{report.description}"</p>
            </div>

            {/* Reporter */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[11px] font-bold text-blue-700">
                {report.user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Signalé par <span className="text-slate-700">{report.user?.name || 'Utilisateur anonyme'}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          {isPending && (
            <div className="flex sm:flex-col gap-2 shrink-0">
              <button onClick={() => onAction(report.id!, 'traite')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all text-[11px] font-bold active:scale-95">
                <CheckCircle size={13} strokeWidth={2.5} />
                <span>Traité</span>
              </button>
              <button onClick={() => onAction(report.id!, 'rejete')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-600 hover:border-slate-600 hover:text-white transition-all text-[11px] font-bold active:scale-95">
                <XCircle size={13} strokeWidth={2.5} />
                <span>Rejeter</span>
              </button>
              <button onClick={() => onAction(report.id!, 'delete_parking')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all text-[11px] font-bold active:scale-95">
                <Trash2 size={13} strokeWidth={2.5} />
                <span>Désactiver</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminReports() {
  const [reports,  setReports]  = useState<Report[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('en_attente');
  const [page,     setPage]     = useState(1);

  const token  = localStorage.getItem('token');
  const apiUrl = (import.meta as any).env.VITE_API_URL;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/reports?status=${filter}`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      if (res.ok) setReports(Array.isArray(data) ? data : (data.data || []));
      else setReports([]);
    } catch { setReports([]); }
    finally { setLoading(false); }
  }, [filter, token, apiUrl]);

  useEffect(() => { fetchReports(); setPage(1); }, [filter]);

  const handleAction = async (reportId: number, action: string) => {
    if (!window.confirm(`Confirmer : ${action.replace('_', ' ')} ?`)) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) setReports(prev => prev.filter(r => r.id !== reportId));
      else { const e = await res.json(); alert(e.message || 'Action impossible'); }
    } catch { alert('Erreur de connexion'); }
  };

  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const paged = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pending = reports.filter(r => r.status === 'en_attente').length;

  return (
    <div className="min-h-screen bg-blue-50/40 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-widest mb-1">Administration</p>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Signalements & <span className="text-blue-700">Modération</span>
            </h1>
            <p className="text-[12px] text-slate-500 mt-1">
              {reports.length} signalement{reports.length > 1 ? 's' : ''}
              {filter === 'en_attente' && pending > 0 && (
                <span className="text-orange-600 font-semibold"> · {pending} en attente</span>
              )}
            </p>
          </div>
          <button onClick={fetchReports} disabled={loading}
            className="self-start sm:self-auto w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-blue-300 transition-colors disabled:opacity-40">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} strokeWidth={2.5} />
          </button>
        </div>

        {/* Banner urgence */}
        {filter === 'en_attente' && pending > 0 && !loading && (
          <div className="bg-slate-900 rounded-xl px-4 py-3.5 flex items-center gap-3 relative overflow-hidden">
            <div className="absolute right-0 inset-y-0 w-40 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right, rgba(249,115,22,.12), transparent)' }} />
            <div className="w-9 h-9 bg-orange-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Flag size={15} className="text-orange-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white leading-tight">
                {pending} signalement{pending > 1 ? 's' : ''} en attente de traitement
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Examinez chaque rapport et prenez les mesures appropriées.</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(({ k, l, active }) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-colors active:scale-95 ${
                filter === k ? active : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>
              {l}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-16 h-5 bg-slate-100 rounded-full" />
                  <div className="w-24 h-5 bg-slate-100 rounded-full" />
                </div>
                <div className="flex gap-3 mb-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-2/5 bg-slate-100 rounded mb-1.5" />
                    <div className="h-3 w-3/5 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-14 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={22} className="text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-semibold text-slate-600">Aucun signalement {FILTERS.find(f => f.k === filter)?.l.toLowerCase()}</p>
            <p className="text-[12px] text-slate-400">Tout est propre dans cette catégorie.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {paged.map(report => (
                <ReportCard key={report.id} report={report} onAction={handleAction} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} total={reports.length} onPage={setPage} />
          </>
        )}

      </div>
    </div>
  );
}

export default AdminReports;