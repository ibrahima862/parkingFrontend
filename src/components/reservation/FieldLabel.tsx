/* ─── FIELD LABEL ─── */
export function FieldLabel({ icon: Icon, label, required }: { icon?: any; label: string; required?: boolean }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#8A93B2', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {Icon && <Icon size={10} color="#C2C9DF" strokeWidth={2.5} />}
            {label}
            {required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
        </label>
    );
}
