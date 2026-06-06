/* ─── UTILS ─── */
export const fmtDate = (d: string, t: string) => !d || !t ? '—' : new Date(`${d}T${t}`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export const fmtDuration = (h: number) => { const hrs = Math.floor(h); const mins = Math.round((h % 1) * 60); return hrs === 0 ? `${mins}min` : mins > 0 ? `${hrs}h${mins}min` : `${hrs}h`; };
export const getToken = () => localStorage.getItem('token') ?? '';
export const getOptimizedImage = (url?: string | null) => {
    const fallback = 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=900';
    if (!url) return fallback;
    let clean = url.includes('https://res.cloudinary.com') ? url.substring(url.indexOf('https://res.cloudinary.com')) : url;
    return clean.includes('cloudinary') ? clean.replace('/upload/', '/upload/f_auto,q_auto,w_900,c_fill,g_auto/') : clean;
};

/* ─── SHARED INPUT STYLE ─── */
export const mkInput = (focused: boolean): React.CSSProperties => ({
    width: '100%', height: 42, padding: '0 14px',
    background: focused ? '#fff' : '#F8F9FC',
    border: `1.5px solid ${focused ? '#1A3A8F' : '#E6EAF5'}`,
    borderRadius: 10, outline: 'none',
    fontSize: 13, fontWeight: 600, color: '#0E1229',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.15s',
});

