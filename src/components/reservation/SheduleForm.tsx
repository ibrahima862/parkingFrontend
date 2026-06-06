import { useState } from "react";
import DatePicker from "react-datepicker";
import { Calendar, Check, Clock, Info, X } from "lucide-react";
import { forwardRef } from "react";
import { ParkingDetails } from "../../type";
import { fmtDate, fmtDuration } from "../../Utils/utils";
import { SectionCard } from "./SectionCard";
import "react-datepicker/dist/react-datepicker.css";

/* ── helpers ── */
const toDate = (date: string, time: string) => {
  if (!date || !time) return null;
  return new Date(`${date}T${time}`);
};

const fromDate = (d: Date) => ({
  date: d.toISOString().split("T")[0],
  time: d.toTimeString().slice(0, 5),
});

/* ── trigger custom ── */
const Trigger = forwardRef<HTMLDivElement, { value?: string; onClick?: () => void; focused: boolean; icon: typeof Calendar; placeholder: string }>(
  ({ value, onClick, focused, icon: Icon, placeholder }, ref) => (
    <div ref={ref} onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8,
      border: `1.5px solid ${focused ? "#6366F1" : "#E2E8F0"}`,
      borderRadius: 10, padding: "9px 12px",
      background: focused ? "#FAFAFF" : "#fff",
      boxShadow: focused ? "0 0 0 3px #EEF2FF" : "none",
      cursor: "pointer", transition: "all 0.15s", width: "100%",
    }}>
      <Icon size={14} color={focused ? "#6366F1" : "#94A3B8"} strokeWidth={2} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: value ? "#1E293B" : "#CBD5E1" }}>
        {value || placeholder}
      </span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
);

/* ── row date + heure ── */
function DateTimeRow({ label, dateKey, timeKey, details, updateField, minDate, focusedField, setFocused }: {
  label: string; dateKey: keyof ParkingDetails; timeKey: keyof ParkingDetails;
  details: ParkingDetails; updateField: (f: keyof ParkingDetails, v: string) => void;
  minDate?: Date; focusedField: string; setFocused: (v: string) => void;
}) {
  const selected = toDate(details[dateKey] as string, details[timeKey] as string);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: ".06em", textTransform: "uppercase", margin: 0 }}>
        {label}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

        {/* Date */}
        <DatePicker
          selected={selected}
          onChange={(d:any) => d && updateField(dateKey, fromDate(d).date)}
          minDate={minDate ?? new Date()}
          showMonthDropdown showYearDropdown dropdownMode="select"
          dateFormat="dd MMM yyyy"
          popperClassName="dp-popper"
          calendarClassName="dp-cal"
          onCalendarOpen={() => setFocused(`${dateKey}-date`)}
          onCalendarClose={() => setFocused("")}
          customInput={
            <Trigger
              focused={focusedField === `${dateKey}-date`}
              icon={Calendar}
              placeholder="jj mmm aaaa"
            />
          }
        />

        {/* Heure */}
        <DatePicker
          selected={selected}
          onChange={(d:any) => d && updateField(timeKey, fromDate(d).time)}
          showTimeSelect showTimeSelectOnly
          timeIntervals={15} timeFormat="HH:mm" dateFormat="HH:mm"
          popperClassName="dp-popper"
          calendarClassName="dp-cal"
          onCalendarOpen={() => setFocused(`${timeKey}-time`)}
          onCalendarClose={() => setFocused("")}
          customInput={
            <Trigger
              focused={focusedField === `${timeKey}-time`}
              icon={Clock}
              placeholder="--:--"
            />
          }
        />
      </div>
    </div>
  );
}

/* ── composant principal ── */
export function ScheduleForm({ details, updateField, dureeH, datesInvalid }: {
  details: ParkingDetails; updateField: (f: keyof ParkingDetails, v: string) => void;
  dureeH: number; datesInvalid: boolean;
}) {
  const [focused, setFocused] = useState("");
  const startDate = toDate(details.dateDebut, details.heureDebut);

  return (
    <>
      {/* CSS datepicker injecté une fois */}
      <style>{`
        .dp-popper { z-index: 999; }
        .dp-cal { font-family: inherit !important; border: 1px solid #E2E8F0 !important; border-radius: 14px !important; padding: 14px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.07) !important; }
        .react-datepicker__header { background: #fff !important; border-bottom: 1px solid #F1F5F9 !important; border-radius: 0 !important; padding: 0 0 10px !important; }
        .react-datepicker__current-month { display: none !important; }
        .react-datepicker__month-select, .react-datepicker__year-select { font-size: 13px !important; font-weight: 600 !important; border: none !important; background: transparent !important; color: #1E293B !important; cursor: pointer !important; padding: 3px 6px !important; border-radius: 6px !important; }
        .react-datepicker__month-select:hover, .react-datepicker__year-select:hover { background: #F1F5F9 !important; }
        .react-datepicker__navigation { top: 12px !important; }
        .react-datepicker__navigation-icon::before { border-color: #94A3B8 !important; border-width: 2px 2px 0 0 !important; }
        .react-datepicker__day-name { font-size: 11px !important; font-weight: 600 !important; color: #94A3B8 !important; text-transform: uppercase !important; width: 34px !important; }
        .react-datepicker__day { width: 34px !important; height: 34px !important; line-height: 34px !important; border-radius: 8px !important; font-size: 13px !important; font-weight: 500 !important; color: #1E293B !important; }
        .react-datepicker__day:hover { background: #F1F5F9 !important; color: #1E293B !important; }
        .react-datepicker__day--selected { background: #6366F1 !important; color: #fff !important; }
        .react-datepicker__day--today { color: #6366F1 !important; font-weight: 700 !important; }
        .react-datepicker__day--outside-month { color: #CBD5E1 !important; }
        .react-datepicker__day--disabled { color: #E2E8F0 !important; cursor: default !important; }
        .react-datepicker__time-list-item { font-size: 13px !important; font-weight: 500 !important; color: #475569 !important; border-radius: 7px !important; height: auto !important; padding: 7px 10px !important; }
        .react-datepicker__time-list-item:hover { background: #F1F5F9 !important; color: #1E293B !important; }
        .react-datepicker__time-list-item--selected { background: #6366F1 !important; color: #fff !important; }
        .react-datepicker__time-container { border-left: 1px solid #F1F5F9 !important; }
        .react-datepicker__time-box { border-radius: 0 !important; }
      `}</style>

      <SectionCard icon={Calendar} iconColor="#6366F1" iconBg="#EEF2FF" iconBorder="#C7D2FE"
        title="Horaires de stationnement" subtitle="Date et heure d'arrivée et de départ">

        <DateTimeRow label="Arrivée" dateKey="dateDebut" timeKey="heureDebut"
          details={details} updateField={updateField}
          focusedField={focused} setFocused={setFocused} />

        {/* Séparateur */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: "#F1F5F9" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1", padding: "3px 10px", border: "1px solid #F1F5F9", borderRadius: 20 }}>→</span>
          <div style={{ flex: 1, height: 1, background: "#F1F5F9" }} />
        </div>

        <DateTimeRow label="Départ" dateKey="dateFin" timeKey="heureFin"
          details={details} updateField={updateField}
          minDate={startDate ?? new Date()}
          focusedField={focused} setFocused={setFocused} />

        {/* Badge durée / erreur */}
        {dureeH > 0 && !datesInvalid ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10 }}>
            <Check size={14} color="#16A34A" strokeWidth={2.5} />
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#15803D" }}>Durée : {fmtDuration(dureeH)}</span>
              <p style={{ fontSize: 11, color: "#4ADE80", margin: "2px 0 0" }}>
                {fmtDate(details.dateDebut, details.heureDebut)} → {fmtDate(details.dateFin, details.heureFin)}
              </p>
            </div>
          </div>
        ) : datesInvalid ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 10 }}>
            <X size={14} color="#E11D48" strokeWidth={2.5} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E11D48" }}>L'heure de départ doit être après l'heure d'arrivée.</span>
          </div>
        ) : null}

        {/* Note info */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10 }}>
          <Info size={13} color="#6366F1" strokeWidth={2} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: "#475569", margin: 0, lineHeight: 1.55 }}>
            Confirmation immédiate après paiement. Un <strong style={{ fontWeight: 600, color: "#1E293B" }}>QR Code</strong> d'accès sera envoyé par SMS.
          </p>
        </div>

      </SectionCard>
    </>
  );
}