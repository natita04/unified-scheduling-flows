
import React, { useEffect, useState } from 'react';
import { MapPin, Search, Navigation, ChevronDown } from 'lucide-react';
import { SchedulingState } from '../../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
import 'leaflet/dist/leaflet.css';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
}

// Component to update map view when location changes
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
};

export const LocationStep: React.FC<Props> = ({ state, updateState }) => {
  const branches = [
    { name: 'Downtown HQ', address: '82 Market St, San Francisco, CA', distance: '0.2 miles from customer', coords: [37.7912, -122.3986] as [number, number] },
    { name: 'Soma Service Center', address: '455 Folsom St, San Francisco, CA', distance: '0.5 miles from customer', coords: [37.7858, -122.3967] as [number, number] },
    { name: 'Bay View Hub', address: '89 Mission St, San Francisco, CA', distance: '0.8 miles from customer', coords: [37.7915, -122.3942] as [number, number] },
    { name: 'Financial District Point', address: '300 Montgomery St, San Francisco, CA', distance: '1.1 miles from customer', coords: [37.7933, -122.4020] as [number, number] },
    { name: 'North Beach Station', address: '1200 Stockton St, San Francisco, CA', distance: '1.4 miles from customer', coords: [37.7989, -122.4085] as [number, number] },
    { name: 'Mission District Depot', address: '2400 Mission St, San Francisco, CA', distance: '2.3 miles from customer', coords: [37.7599, -122.4194] as [number, number] },
    { name: 'Marina Heights Hub', address: '2100 Chestnut St, San Francisco, CA', distance: '3.5 miles from customer', coords: [37.8011, -122.4373] as [number, number] },
  ];

  const selectedBranch = branches.find(b => b.address === state.location) || branches[0];

  useEffect(() => {
    if (!state.location) {
      updateState({ location: branches[0].address });
    }
  }, []);

  return (
    <div className="flex flex-col h-[620px] animate-in slide-in-from-right-4 duration-300">
      <div className="flex gap-2.5 pt-1 mb-5">
        <div className="flex-[2] relative">
          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Location</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search location" 
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-[13px]"
              value={state.location}
              onChange={(e) => updateState({ location: e.target.value })}
            />
          </div>
        </div>
        
        <div className="flex-1 relative">
          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Within</label>
          <div className="relative">
            <select 
              className="w-full pl-2.5 pr-7 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-[13px] font-medium cursor-pointer"
              value={state.radius || '10 miles'}
              onChange={(e) => updateState({ radius: e.target.value })}
            >
              <option>5 miles</option>
              <option>10 miles</option>
              <option>20 miles</option>
              <option>50 miles</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* List Column (1/3) */}
        <div className="w-1/3 flex flex-col gap-2.5 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-white py-1 z-10">Available Branches</p>
          {branches.map((branch) => (
            <div 
              key={branch.name}
              onClick={() => updateState({ location: branch.address })}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                state.location === branch.address 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${state.location === branch.address ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <MapPin size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[12px] truncate">{branch.name}</p>
                <p className="text-[10px] text-gray-500 leading-tight truncate">{branch.address}</p>
                <p className="text-[9px] text-gray-400 leading-tight mt-0.5">{branch.distance}</p>
              </div>
              <button className="ml-auto text-blue-600 p-1 shrink-0">
                <Navigation size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Map Column (2/3) */}
        <div className="w-2/3 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
          <MapContainer 
            center={selectedBranch.coords} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {branches.map((branch) => (
              <Marker 
                key={branch.name} 
                position={branch.coords}
                eventHandlers={{
                  click: () => updateState({ location: branch.address }),
                }}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-[13px]">{branch.name}</p>
                    <p className="text-[11px] text-gray-500">{branch.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapUpdater center={selectedBranch.coords} />
          </MapContainer>
          
          {/* Custom Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <div className="bg-white p-2 rounded-lg shadow-md border border-gray-200 flex flex-col gap-2">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 font-bold text-lg">+</button>
              <div className="h-px bg-gray-200 mx-1" />
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 font-bold text-lg">−</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
