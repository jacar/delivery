import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { geocodeAddress } from '../services/geocodingService';
import TrackingMap from './TrackingMap';
import { motion, AnimatePresence } from 'motion/react';

interface AddressInputWithMapProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (address: string) => void;
  onLocationResolved: (lat: number, lng: number) => void;
  initialCoords?: { lat: number, lng: number } | null;
  icon?: React.ReactNode;
}

export default function AddressInputWithMap({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  onLocationResolved,
  initialCoords,
  icon
}: AddressInputWithMapProps) {
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(initialCoords || null);
  const [resolved, setResolved] = useState(!!initialCoords);

  const handleSearch = async () => {
    if (!value || value.length < 3) return;
    setLoading(true);
    const result = await geocodeAddress(value);
    setLoading(false);
    
    if (result) {
      setCoords({ lat: result.lat, lng: result.lng });
      onLocationResolved(result.lat, result.lng);
      setResolved(true);
      setShowMap(true);
    } else {
      // Si no se encuentra, mostramos un mapa por defecto cerca de la posición del usuario
      // para que pueda marcar manualmente
      if (!coords) {
        setCoords({ lat: 10.4806, lng: -66.9036 }); // Default fallback
      }
      setShowMap(true);
      setResolved(false);
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    onLocationResolved(lat, lng);
    setResolved(true);
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-400 transition-colors">
          {icon || <MapPin size={20} />}
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-14 pr-32 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 outline-none transition-all text-gray-700 font-medium"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setResolved(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          required
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {resolved && !loading && (
            <div className="text-green-500 mr-2" title="Ubicación precisada">
              <CheckCircle2 size={20} />
            </div>
          )}
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {showMap ? 'Recalcular' : 'Ubicar'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showMap && coords && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm"
          >
            <div className="bg-orange-50 px-6 py-2 flex justify-between items-center">
              <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                {resolved ? '✓ Ubicación detectada - Arrastra el marcador para ajustar' : '⚠ No detectado - Ubica manualmente en el mapa'}
              </p>
              <button 
                type="button" 
                onClick={() => setShowMap(false)}
                className="text-[9px] font-black text-gray-400 hover:text-gray-600 uppercase"
              >
                Ocultar Mapa
              </button>
            </div>
            <div className="h-[200px]">
              <TrackingMap 
                isPicker 
                initialCenter={[coords.lat, coords.lng]} 
                onLocationChange={handleLocationChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
