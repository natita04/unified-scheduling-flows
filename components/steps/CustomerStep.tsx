
import React, { useState, useRef, useEffect } from 'react';
import { FEATURE_FLAGS } from '../../featureFlags';
import {
  Search,
  Check,
  X,
  User,
  Settings2,
  Link,
  Mail,
  Plus,
  ChevronDown,
  MapPin,
  Building2,
  Phone,
  Video,
  Wrench,
  Users,
  Gavel,
  HelpCircle,
  Contact,
  Calendar,
  Stethoscope,
  RotateCcw
} from 'lucide-react';
import { SchedulingState, Customer, WorkType, ServiceMode, Resource } from '../../types';
import { MOCK_CUSTOMERS, MOCK_RESOURCES } from '../../constants';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
  onFastTrack: () => void;
  onBookAgain: (workType: WorkType, serviceMode: ServiceMode, resource: Resource) => void;
}

const RECENTLY_SCHEDULED_TYPES = [
  WorkType.GENERAL,
  WorkType.WORKSHOP,
  WorkType.VIRTUAL,
];

const ALL_WORK_TYPES = [
  WorkType.INSTALLATION,
  WorkType.BREAK_FIX,
  WorkType.BLOOD_TEST,
  WorkType.TRIAL,
  WorkType.INSPECTION,
  WorkType.MORTGAGE_ADVICE,
];

const ALL_SERVICE_MODES = [
  { mode: ServiceMode.ONSITE, icon: Building2, desc: 'At our branch' },
  { mode: ServiceMode.IN_FIELD, icon: MapPin, desc: 'At customer location' },
  { mode: ServiceMode.PHONE, icon: Phone, desc: 'Voice call' },
  { mode: ServiceMode.VIDEO, icon: Video, desc: 'Video session' },
];

const SERVICE_MODES = FEATURE_FLAGS.FEATURE_PHONE_VIDEO_CHANNELS
  ? ALL_SERVICE_MODES
  : ALL_SERVICE_MODES.filter(m => m.mode !== ServiceMode.PHONE && m.mode !== ServiceMode.VIDEO);

const TERRITORIES = ['San Francisco', 'Los Angeles', 'San Diego', 'San Mateo', 'Forest City', 'San Jose'];

const LATEST_APPOINTMENTS = [
  {
    id: 'la1',
    resourceId: 'r1',
    workType: WorkType.INSTALLATION,
    label: 'Installation',
    serviceMode: ServiceMode.IN_FIELD,
    date: 'Apr 18, 2025',
  },
  {
    id: 'la2',
    resourceId: 'r22',
    workType: WorkType.BLOOD_TEST,
    label: 'Blood Test',
    serviceMode: ServiceMode.ONSITE,
    date: 'May 20, 2025',
  },
];

const MODE_CONFIG = {
  [ServiceMode.IN_FIELD]: { icon: MapPin,    dotBg: 'bg-rose-400',    chipBg: 'bg-rose-50',    chipText: 'text-rose-600'    },
  [ServiceMode.ONSITE]:   { icon: Building2, dotBg: 'bg-blue-500',   chipBg: 'bg-blue-50',   chipText: 'text-blue-600'   },
  [ServiceMode.PHONE]:    { icon: Phone,     dotBg: 'bg-emerald-500', chipBg: 'bg-emerald-50', chipText: 'text-emerald-600' },
  [ServiceMode.VIDEO]:    { icon: Video,     dotBg: 'bg-violet-500',  chipBg: 'bg-violet-50',  chipText: 'text-violet-600'  },
};

export const CustomerStep: React.FC<Props> = ({ state, updateState, onFastTrack, onBookAgain }) => {
  // Customer Selection State
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [activeCustomerIdx, setActiveCustomerIdx] = useState(-1);
  const [emailInput, setEmailInput] = useState('');
  const [showLatest, setShowLatest] = useState(false);
  const customerRef = useRef<HTMLDivElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);

  // Work Type Selection State
  const [workSearch, setWorkSearch] = useState('');
  const [isWorkOpen, setIsWorkOpen] = useState(false);
  const workRef = useRef<HTMLDivElement>(null);
  const workInputRef = useRef<HTMLInputElement>(null);
  const [isTerrOpen, setIsTerrOpen] = useState(false);
  const terrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerRef.current && !customerRef.current.contains(event.target as Node)) {
        setIsCustomerOpen(false);
      }
      if (workRef.current && !workRef.current.contains(event.target as Node)) {
        setIsWorkOpen(false);
        setWorkSearch('');
      }
      if (terrRef.current && !terrRef.current.contains(event.target as Node)) {
        setIsTerrOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Customer Handlers
  const handleSelectCustomer = (customer: Customer) => {
    updateState({ customers: [customer] });
    setIsCustomerOpen(false);
    setCustomerSearch('');
  };

  const removeCustomer = (id: string) => {
    updateState({ customers: state.customers.filter(c => c.id !== id) });
  };

  const addEmail = () => {
    if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      const currentEmails = state.additionalEmails || [];
      if (!currentEmails.includes(emailInput)) {
        updateState({ additionalEmails: [...currentEmails, emailInput] });
      }
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    updateState({ additionalEmails: (state.additionalEmails || []).filter(e => e !== email) });
  };

  // Work Type Handlers
  const handleSelectWorkType = (type: WorkType) => {
    let nextMode = null;
    let nextIsMultiResource = false;
    let nextIsMultiCustomer = false;

    if (type === WorkType.INSTALLATION) {
      nextMode = ServiceMode.IN_FIELD;
    } else if (type === WorkType.WORKSHOP) {
      nextMode = ServiceMode.ONSITE;
      nextIsMultiCustomer = true;
    } else if (type === WorkType.VIRTUAL) {
      nextMode = ServiceMode.ONSITE;
    } else if (type === WorkType.TRIAL) {
      nextMode = ServiceMode.ONSITE;
      nextIsMultiResource = true;
    } else if (type === WorkType.GENERAL) {
      nextMode = ServiceMode.ONSITE;
    } else if (type === WorkType.BREAK_FIX) {
      nextMode = ServiceMode.IN_FIELD;
    } else if (type === WorkType.BLOOD_TEST) {
      nextMode = ServiceMode.ONSITE;
    } else if (type === WorkType.INSPECTION) {
      nextMode = ServiceMode.IN_FIELD;
    } else if (type === WorkType.MORTGAGE_ADVICE) {
      nextMode = ServiceMode.VIDEO;
    }

    const isInField = nextMode === ServiceMode.IN_FIELD;
    updateState({
      workType: type,
      serviceMode: nextMode,
      isMultiResource: nextIsMultiResource,
      isMultiCustomer: nextIsMultiCustomer,
      location: isInField ? (state.customers[0]?.address || '30 Market Street, San Francisco, CA') : '',
    });
    setWorkSearch('');
    setIsWorkOpen(false);
  };

  const isModeDisabled = (mode: ServiceMode) => {
    if (state.workType === WorkType.INSTALLATION) return mode !== ServiceMode.IN_FIELD;
    if (state.workType === WorkType.WORKSHOP) return mode !== ServiceMode.ONSITE;
    if (state.workType === WorkType.VIRTUAL) return mode === ServiceMode.IN_FIELD;
    if (state.workType === WorkType.TRIAL) return mode !== ServiceMode.ONSITE;
    if (state.workType === WorkType.BREAK_FIX) return mode !== ServiceMode.IN_FIELD;
    if (state.workType === WorkType.BLOOD_TEST) return mode !== ServiceMode.ONSITE;
    if (state.workType === WorkType.INSPECTION) return mode !== ServiceMode.IN_FIELD;
    if (state.workType === WorkType.MORTGAGE_ADVICE) return mode !== ServiceMode.VIDEO;
    return false;
  };

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredRecent = RECENTLY_SCHEDULED_TYPES.filter(t =>
    t.toLowerCase().includes(workSearch.toLowerCase())
  );
  const filteredAll = ALL_WORK_TYPES.filter(t =>
    t.toLowerCase().includes(workSearch.toLowerCase())
  );

  const selectedCustomer = state.customers[0];

  return (
    <div className="space-y-7 animate-in slide-in-from-right-4 duration-300 pb-2">
      {/* SECTION 1: PARENT RECORD */}
      <div className="space-y-3">
        <div className="relative" ref={customerRef}>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              SELECT CUSTOMER
            </label>
            {FEATURE_FLAGS.FEATURE_VIEW_LATEST_APPOINTMENTS && selectedCustomer && (
              <button
                onClick={() => setShowLatest(!showLatest)}
                className="text-[10px] font-bold text-[#0176d3] uppercase tracking-widest hover:underline transition-all"
              >
                {showLatest ? 'HIDE LATEST APPOINTMENTS' : 'VIEW LATEST APPOINTMENTS'}
              </button>
            )}
          </div>
          
          <div 
            className={`flex items-stretch bg-white border-2 rounded-xl h-11 overflow-hidden transition-all shadow-sm ${
              isCustomerOpen ? 'border-blue-400' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Split Lookup - Left Part: Type Selector */}
            <div className="flex items-center gap-2 px-3 border-r border-gray-100 bg-gray-50/30 shrink-0 cursor-default">
              <div className="w-5 h-5 bg-[#0176d3] rounded-full flex items-center justify-center text-white shrink-0">
                <Contact size={12} strokeWidth={3} />
              </div>
              <span className="text-[13px] font-bold text-gray-700">Account</span>
              <ChevronDown size={14} className="text-gray-400 ml-0.5" />
            </div>

            {/* Split Lookup - Right Part: Record Selector */}
            <div 
              className="flex-1 flex items-center gap-2 px-3 relative cursor-text overflow-hidden"
              onClick={() => customerInputRef.current?.focus()}
            >
              <div className="w-5 h-5 bg-[#0176d3] rounded flex items-center justify-center text-white shrink-0">
                <Building2 size={12} strokeWidth={3} />
              </div>
              
              {selectedCustomer && !isCustomerOpen && !customerSearch ? (
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 bg-[#e0f2fe] text-[#0176d3] px-2 py-0.5 rounded-md text-[13px] font-bold animate-in zoom-in-95">
                    <span className="truncate">{selectedCustomer.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCustomer(selectedCustomer.id); }}
                      className="p-0.5 hover:bg-blue-200/50 rounded transition-colors shrink-0"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ) : (
                <input 
                  ref={customerInputRef}
                  type="text" 
                  placeholder={!selectedCustomer ? "Search for a record..." : ""}
                  className="flex-1 bg-transparent text-[13px] font-bold focus:outline-none placeholder:text-gray-400"
                  value={customerSearch}
                  onFocus={() => setIsCustomerOpen(true)}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setIsCustomerOpen(true);
                    setActiveCustomerIdx(-1);
                  }}
                />
              )}
              
              <div className="text-gray-400 shrink-0 ml-1">
                <Search size={16} />
              </div>
            </div>
          </div>

          {isCustomerOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="max-h-[180px] overflow-y-auto custom-scrollbar py-1.5 px-1">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, index) => {
                    const isSelected = selectedCustomer?.id === customer.id;
                    return (
                      <button
                        key={customer.id}
                        onMouseEnter={() => setActiveCustomerIdx(index)}
                        onClick={() => handleSelectCustomer(customer)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] flex items-center gap-2.5 transition-all ${
                          activeCustomerIdx === index 
                          ? 'bg-[#001639] text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-4 flex justify-center shrink-0">
                          {isSelected && <Check size={14} className={activeCustomerIdx === index ? 'text-white' : 'text-blue-600'} />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{customer.name}</p>
                          <p className={`text-[10px] ${activeCustomerIdx === index ? 'text-gray-300' : 'text-gray-400'}`}>
                            {customer.email}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-6 text-center">
                    <p className="text-[12px] text-gray-400 italic">No records found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Latest Appointments Expanded View */}
          {showLatest && selectedCustomer && (
            <div className="mt-3 space-y-2.5 animate-in slide-in-from-top-4 duration-300">
              {LATEST_APPOINTMENTS.map(apt => {
                const resource = MOCK_RESOURCES.find(r => r.id === apt.resourceId);
                if (!resource) return null;
                const modeConfig = MODE_CONFIG[apt.serviceMode];
                const ModeIcon = modeConfig.icon;
                const WorkTypeIcon = apt.workType === WorkType.BLOOD_TEST ? Stethoscope : Wrench;
                return (
                  <div key={apt.id} className="rounded-xl border border-gray-100 p-3.5 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-3.5">
                    {/* Avatar with mode dot */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-100">
                        <img src={resource.avatar} alt={resource.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${modeConfig.dotBg}`}>
                        <ModeIcon size={8} className="text-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[13px] font-bold text-gray-900 truncate">{resource.name}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-[11px] text-gray-400 font-medium truncate">{resource.role}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md text-[11px] font-semibold text-gray-600">
                          <WorkTypeIcon size={10} className="text-gray-400" />
                          {apt.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${modeConfig.chipBg} ${modeConfig.chipText}`}>
                          <ModeIcon size={10} />
                          {apt.serviceMode}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
                          <Calendar size={10} />
                          {apt.date}
                        </span>
                      </div>
                    </div>

                    {/* Book Again */}
                    <button
                      onClick={() => onBookAgain(apt.workType, apt.serviceMode, resource)}
                      className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-[#0176d3] text-white text-[12px] font-bold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
                    >
                      <RotateCcw size={12} />
                      Book Again
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: WORK TYPE, TERRITORY & CHANNEL */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-6 items-start">

          {/* LEFT COLUMN: Work Type + Service Territory */}
          <div className="space-y-4">
            <div ref={workRef}>
              <div className="flex items-center justify-between px-1 mb-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">SELECT WORK TYPE</label>
              </div>
          
          <div className="space-y-3.5 relative">
            <div 
              className={`relative flex items-center bg-white border-2 rounded-xl transition-all shadow-sm ${isWorkOpen ? 'border-blue-400' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => workInputRef.current?.focus()}
            >
              <div className="pl-3 text-gray-400 shrink-0"><Search size={16} /></div>
              <input 
                ref={workInputRef}
                type="text" 
                placeholder={state.workType ? "" : "All work types"}
                className="w-full pl-2 pr-9 py-2.5 bg-transparent text-[13px] font-semibold focus:outline-none outline-none"
                value={workSearch || (isWorkOpen ? '' : (state.workType || ''))}
                onFocus={() => setIsWorkOpen(true)}
                onChange={(e) => setWorkSearch(e.target.value)}
              />
              <div className="absolute right-2 flex items-center gap-0.5">
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsWorkOpen(!isWorkOpen); }} className="p-1 text-gray-400 hover:text-gray-600"><ChevronDown size={16} className={`transition-transform duration-200 ${isWorkOpen ? 'rotate-180' : ''}`} /></button>
              </div>
            </div>

            {isWorkOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="max-h-64 overflow-y-auto custom-scrollbar py-1.5 px-1">
                  {filteredRecent.length === 0 && filteredAll.length === 0 ? (
                    <div className="px-3 py-6 text-center"><p className="text-[12px] text-gray-400 italic">No matching work types found</p></div>
                  ) : (
                    <>
                      {filteredRecent.length > 0 && (
                        <>
                          <div className="px-3 pt-1 pb-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recently Scheduled</span>
                          </div>
                          {filteredRecent.map((type) => (
                            <button key={type} onClick={() => handleSelectWorkType(type as WorkType)} className={`w-full text-left px-3.5 py-2.5 rounded-lg text-[12px] font-bold flex items-center justify-between transition-all ${state.workType === type ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                              <span>{type}</span>
                              {state.workType === type && <Check size={14} className="text-blue-600" />}
                            </button>
                          ))}
                        </>
                      )}
                      {filteredRecent.length > 0 && filteredAll.length > 0 && (
                        <div className="mx-2 my-1.5 border-t border-gray-100" />
                      )}
                      {filteredAll.length > 0 && (
                        <>
                          <div className="px-3 pt-1 pb-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">All Work Types</span>
                          </div>
                          {filteredAll.map((type) => (
                            <button key={type} onClick={() => handleSelectWorkType(type as WorkType)} className={`w-full text-left px-3.5 py-2.5 rounded-lg text-[12px] font-bold flex items-center justify-between transition-all ${state.workType === type ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                              <span>{type}</span>
                              {state.workType === type && <Check size={14} className="text-blue-600" />}
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            </div>
            </div>

            {/* SELECT SERVICE TERRITORY */}
            <div ref={terrRef}>
              <div className="px-1 mb-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">SELECT SERVICE TERRITORY</label>
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsTerrOpen(prev => !prev)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-[13px] font-medium text-gray-800 hover:border-gray-300 outline-none transition-all shadow-sm"
                >
                  <span>{state.territory || 'San Francisco'}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${isTerrOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTerrOpen && (
                  <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                    {TERRITORIES.map(t => (
                      <button
                        key={t}
                        onClick={() => { updateState({ territory: t }); setIsTerrOpen(false); }}
                        className={`w-full text-left px-3.5 py-2.5 text-[13px] font-medium flex items-center justify-between transition-colors ${state.territory === t ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {t}
                        {state.territory === t && <Check size={13} className="text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Work Channel */}
          {state.workType && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-1 mb-1.5">SELECT WORK CHANNEL</label>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_MODES.map((opt) => {
                  const disabled = isModeDisabled(opt.mode);
                  return (
                    <button
                      key={opt.mode}
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        const inField = opt.mode === ServiceMode.IN_FIELD;
                        updateState({
                          serviceMode: opt.mode,
                          location: inField
                            ? (state.customers[0]?.address || '30 Market Street, San Francisco, CA')
                            : (state.serviceMode === ServiceMode.IN_FIELD ? '' : state.location),
                        });
                      }}
                      className={`flex flex-col items-center justify-center text-center py-8 px-3 rounded-xl border-2 transition-all gap-2 relative ${disabled ? 'border-gray-50 bg-gray-50 opacity-40 cursor-not-allowed' : state.serviceMode === opt.mode ? 'border-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-600/10' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${disabled ? 'bg-gray-200 text-gray-400' : state.serviceMode === opt.mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}><opt.icon size={20} /></div>
                      <div className="min-w-0">
                        <p className={`text-[12px] font-bold ${disabled ? 'text-gray-400' : state.serviceMode === opt.mode ? 'text-blue-900' : 'text-gray-900'}`}>{opt.mode}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                      </div>
                      {state.serviceMode === opt.mode && !disabled && <div className="absolute top-2 right-2"><Check size={12} className="text-blue-600" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {state.workType && (
          <div>

            {state.serviceMode === ServiceMode.IN_FIELD && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-1">Customer Address</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={state.location}
                    onChange={(e) => updateState({ location: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-[13px] font-medium text-gray-800 focus:border-blue-400 outline-none transition-all shadow-sm"
                    placeholder="Enter customer address"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {(state.isMultiCustomer || state.isMultiResource) && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* ATTENDEE LIMITS */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-1">ATTENDEE LIMITS</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={state.minParticipantsEnabled} onChange={(e) => updateState({ minParticipantsEnabled: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Min attendees</span>
                  </label>
                  {state.minParticipantsEnabled && (
                    <input type="number" min="1" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-bold text-center focus:border-blue-500 focus:bg-white outline-none transition-all animate-in slide-in-from-top-1" value={state.minParticipants || 1} onChange={(e) => updateState({ minParticipants: parseInt(e.target.value) || 1 })} />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={state.maxParticipantsEnabled} onChange={(e) => updateState({ maxParticipantsEnabled: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Max attendees</span>
                  </label>
                  {state.maxParticipantsEnabled && (
                    <input type="number" min="1" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-bold text-center focus:border-blue-500 focus:bg-white outline-none transition-all animate-in slide-in-from-top-1" value={state.maxParticipants || 10} onChange={(e) => updateState({ maxParticipants: parseInt(e.target.value) || 10 })} />
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* GUEST INVITATIONS */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-1">GUEST INVITATIONS</label>
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-gray-600 block px-1">Invite internal guests</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="email" placeholder="guest@example.com" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-[13px]" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
                  </div>
                  <button onClick={addEmail} className="px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"><Plus size={20} /></button>
                </div>
                {state.additionalEmails && state.additionalEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {state.additionalEmails.map(email => (
                      <div key={email} className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-[11px] font-bold text-blue-700 flex items-center gap-2 animate-in zoom-in-95">
                        {email}
                        <button onClick={() => removeEmail(email)} className="text-blue-400 hover:text-blue-600 transition-colors"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Users size={18} className="text-gray-500" /></div>
                    <span className="text-[13px] font-bold text-gray-700">Allow external guests</span>
                  </div>
                  <input type="checkbox" checked={state.allowExternalGuests} onChange={(e) => { const checked = e.target.checked; updateState({ allowExternalGuests: checked, isOpenForSigning: checked ? state.isOpenForSigning : false }); }} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                </div>
                <div className={`flex items-center justify-between px-1 transition-all ${!state.allowExternalGuests ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Link size={18} className="text-gray-500" /></div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-gray-700">Allow self-signup via link</span>
                      <div className="relative group cursor-help">
                        <HelpCircle size={14} className="text-gray-400 hover:text-gray-600 transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-[#001639] text-white text-[11px] font-medium rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl z-50 text-center">
                          A signup link will be provided at the end of the flow.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-[#001639]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <input type="checkbox" disabled={!state.allowExternalGuests} checked={state.isOpenForSigning} onChange={(e) => updateState({ isOpenForSigning: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
