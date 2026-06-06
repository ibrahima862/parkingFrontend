import Map, { Marker, NavigationControl, Popup, GeolocateControl } from 'react-map-gl/mapbox';
import { useState, useMemo } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ArrowRight, MapPin} from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaWJyYWhpbWExMjMiLCJhIjoiY21udzlwOWZsMWFlbTJvczlwbjVrcDV0eiJ9.tfdxv0Td74JwVUqmqyQ6yg';

interface MapProps {
    items?: any[];
    onReserve?: (id: number) => void;
}

export function MapComponent({ items = [], onReserve }: MapProps) {
    const [selectedParking, setSelectedParking] = useState<any>(null);

    // Mémoriser les marqueurs pour éviter des re-rendus inutiles
    const markers = useMemo(() => items.map(p => {
        const lng = parseFloat(p.longitude);
        const lat = parseFloat(p.latitude);
        if (isNaN(lng) || isNaN(lat)) return null;

        return (
            <Marker
                key={p.id}
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                onClick={e => {
                    // Empêche la carte de recevoir le clic (ce qui fermerait le popup)
                    e.originalEvent.stopPropagation();
                    setSelectedParking(p);
                }}
            >
                <button className="flex flex-col items-center group transition-transform hover:scale-110 active:scale-95">
                    <div className="bg-white px-3 py-1.5 rounded-full shadow-2xl border-[2.5px] border-[#0C0E14] group-hover:bg-[#0C0E14] transition-all">
                        <span className="text-[#0C0E14] group-hover:text-white font-black text-[11px]">
                            {p.prix_base} F
                        </span>
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#0C0E14] -mt-0.5" />
                </button>
            </Marker>
        );
    }), [items]);
console.log(items)
    return (
        <div className="h-full w-full relative">
            <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{
                    longitude: -17.4441,
                    latitude: 14.6937,
                    zoom: 13,
                }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                style={{ width: '100%', height: '100%' }}
                // Ferme le popup si on clique sur la carte (optionnel)
                onClick={() => setSelectedParking(null)}
            >
                <GeolocateControl position="bottom-right" />
                <NavigationControl position="bottom-right" />

                {markers}

                {selectedParking && (
                    <Popup
                        longitude={parseFloat(selectedParking.longitude)}
                        latitude={parseFloat(selectedParking.latitude)}
                        anchor="bottom"
                        offset={45}
                        onClose={() => setSelectedParking(null)}
                        closeButton={false}
                        maxWidth="260px"
                    >
                        <div>

                            {/* Header image */}
                            <div className="relative h-[120px] overflow-hidden">
                                <img
                                    src={selectedParking.image}
                                    alt={selectedParking.nom}
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay dégradé pour lisibilité */}
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/30 to-transparent" />

                                {/* Badges top */}
                                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest">parking</span>
                                    {selectedParking.isVerifie && (
                                        <span className="text-[10px] font-medium text-white/90 bg-blue-700/70 border border-blue-500/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                            Vérifié
                                        </span>
                                    )}
                                </div>

                                {/* Infos bas de l'image */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                                    <div>
                                        <p className="text-[15px] font-medium text-white m-0 leading-tight">{selectedParking.nom}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <MapPin size={10} className="text-orange-400" />
                                            <span className="text-[11px] text-white/60">{selectedParking.quartier}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[18px] font-medium text-white m-0 leading-tight">
                                            {selectedParking.prix_base}
                                            <span className="text-[11px] text-white/50 font-normal"> F</span>
                                        </p>
                                        <p className="text-[10px] text-white/40 m-0">par heure</p>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-4 pt-3.5">

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-3.5">
                                    <div className="bg-blue-50 rounded-lg px-3 py-2.5">
                                        <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-0.5">Disponibles</p>
                                        <p className="text-base font-medium text-blue-800 m-0">
                                            {selectedParking.disponible}
                                            <span className="text-[11px] text-blue-300 font-normal"> / {selectedParking.capacite}</span>
                                        </p>
                                    </div>
                                    <div className="bg-orange-50 rounded-lg px-3 py-2.5">
                                        <p className="text-[10px] text-orange-400 uppercase tracking-wider mb-0.5">Occupation</p>
                                        <p className="text-base font-medium text-orange-700 m-0">
                                            {Math.round((selectedParking.disponible / selectedParking.capacite) * 100)}
                                            <span className="text-[11px] text-orange-300 font-normal">%</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="h-[3px] bg-blue-50 rounded-full overflow-hidden mb-3.5">
                                    <div
                                        className="h-full bg-orange-500 rounded-full transition-all duration-700"
                                        style={{ width: `${(selectedParking.disponible / selectedParking.capacite) * 100}%` }}
                                    />
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onReserve?.(selectedParking.id); }}
                                    className="w-full bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white rounded-lg py-2.5 text-[12px] font-medium tracking-wide flex items-center justify-center gap-1.5 transition-all"
                                >
                                    Réserver maintenant
                                    <ArrowRight size={12} className="text-orange-400" />
                                </button>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}