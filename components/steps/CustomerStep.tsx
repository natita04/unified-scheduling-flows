
import React, { useState, useRef, useEffect } from 'react';
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
  Stethoscope
} from 'lucide-react';
import { SchedulingState, Customer, WorkType, ServiceMode } from '../../types';
import { MOCK_CUSTOMERS } from '../../constants';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
  onFastTrack: () => void;
}

const ALL_WORK_TYPES = [
  WorkType.INSTALLATION,
  WorkType.WORKSHOP,
  WorkType.VIRTUAL,
  WorkType.TRIAL,
  WorkType.GENERAL,
  WorkType.BREAK_FIX,
  WorkType.BLOOD_TEST
];

const SERVICE_MODES = [
  { mode: ServiceMode.IN_FIELD, icon: MapPin, desc: 'At customer location' },
  { mode: ServiceMode.ONSITE, icon: Building2, desc: 'At our branch' },
  { mode: ServiceMode.PHONE, icon: Phone, desc: 'Voice call' },
  { mode: ServiceMode.VIDEO, icon: Video, desc: 'Video session' },
];

const LATEST_APPOINTMENTS = [
  {
    id: 'la1',
    name: 'Brooke Weaver',
    role: 'Technician',
    workType: 'Repair',
    mode: 'In-Field',
    date: 'Apr 18, 2025',
    avatar: 'https://picsum.photos/seed/brooke/100/100',
    initials: 'BW'
  },
  {
    id: 'la2',
    name: 'Allison Baker',
    role: 'Registered Nurse',
    workType: 'Health Check-Up',
    mode: 'On-Site',
    date: 'May 20, 2025',
    avatar: null,
    initials: 'AB'
  }
];

export const CustomerStep: React.FC<Props> = ({ state, updateState, onFastTrack }) => {
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerRef.current && !customerRef.current.contains(event.target as Node)) {
        setIsCustomerOpen(false);
      }
      if (workRef.current && !workRef.current.contains(event.target as Node)) {
        setIsWorkOpen(false);
        setWorkSearch('');
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
      nextIsMultiResource = false;
    } else if (type === WorkType.WORKSHOP) {
      nextMode = ServiceMode.ONSITE;
      nextIsMultiCustomer = true;
      nextIsMultiResource = false;
    } else if (type === WorkType.VIRTUAL) {
      nextMode = ServiceMode.PHONE;
      nextIsMultiResource = false;
    } else if (type === WorkType.TRIAL) {
      nextMode = ServiceMode.ONSITE;
      nextIsMultiResource = true;
    } else if (type === WorkType.GENERAL) {
      nextMode = ServiceMode.ONSITE;
      nextIsMultiResource = false;
    } else if (type === WorkType.BREAK_FIX) {
      nextMode = ServiceMode.IN_FIELD;
      nextIsMultiResource = false;
    } else if (type === WorkType.BLOOD_TEST) {
      nextMode = ServiceMode.ONSITE;
      nextIsMultiResource = false;
    }

    updateState({ 
      workType: type, 
      serviceMode: nextMode, 
      isMultiResource: nextIsMultiResource,
      isMultiCustomer: nextIsMultiCustomer
    });
    setWorkSearch('');
    setIsWorkOpen(false);
  };

  const isModeDisabled = (mode: ServiceMode) => {
    if (state.workType === WorkType.INSTALLATION) return mode !== ServiceMode.IN_FIELD;
    if (state.workType === WorkType.WORKSHOP) return mode !== ServiceMode.ONSITE;
    if (state.workType === WorkType.VIRTUAL) return mode !== ServiceMode.PHONE && mode !== ServiceMode.VIDEO;
    if (state.workType === WorkType.TRIAL) return mode !== ServiceMode.ONSITE;
    if (state.workType === WorkType.BREAK_FIX) return mode !== ServiceMode.IN_FIELD;
    if (state.workType === WorkType.BLOOD_TEST) return mode !== ServiceMode.ONSITE;
    return false;
  };

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredWorkTypes = ALL_WORK_TYPES.filter(t => 
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
            {selectedCustomer && (
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
              isCustomerOpen ? 'border-[#001639] ring-1 ring-[#001639]' : 'border-gray-200 hover:border-gray-300'
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
            <div className="mt-4 space-y-3 animate-in slide-in-from-top-4 duration-300">
              {LATEST_APPOINTMENTS.map(apt => (
                <div key={apt.id} className="border-[#0176d3] border-[1.5px] rounded-[1.25rem] p-4 flex items-center gap-4 bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-100">
                    {apt.avatar ? (
                      <img src={apt.avatar} alt={apt.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 font-bold text-sm">{apt.initials}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline truncate">
                      <span className="text-[#0176d3] text-[15px] font-bold">{apt.name}</span>
                      <span className="mx-1 text-[#0176d3] opacity-60">•</span>
                      <span className="text-[#0176d3] text-[13px] font-medium truncate">{apt.role}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <div className="bg-[#f3f3f3] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                        {apt.workType.toLowerCase().includes('repair') ? <Wrench size={12} className="text-emerald-500" /> : <Stethoscope size={12} className="text-emerald-500" />}
                        {apt.workType}
                      </div>
                      <div className="bg-[#f3f3f3] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                        <MapPin size={12} className="text-rose-400 fill-rose-400/20" />
                        {apt.mode}
                      </div>
                      <div className="bg-[#f3f3f3] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                        <Calendar size={12} className="text-[#001639]" />
                        {apt.date}
                      </div>
                    </div>
                  </div>
                  <button className="bg-[#0176d3] text-white px-4 py-1.5 rounded-full text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm shrink-0">
                    Book Again
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: WORK TYPE & METHOD */}
      <div className="space-y-5">
        <div ref={workRef}>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">SELECT WORK TYPE</label>
          </div>
          
          <div className="space-y-3.5 relative">
            <div 
              className={`relative flex items-center bg-white border-2 rounded-xl transition-all shadow-sm ${isWorkOpen ? 'border-[#001639] ring-1 ring-[#001639]' : 'border-gray-200 hover:border-gray-300'}`}
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
                {state.workType && !workSearch && (
                  <button onClick={(e) => { e.stopPropagation(); updateState({ workType: null, serviceMode: null, isMultiCustomer: false }); }} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"><X size={14} /></button>
                )}
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsWorkOpen(!isWorkOpen); }} className="p-1 text-gray-400 hover:text-gray-600"><ChevronDown size={16} className={`transition-transform duration-200 ${isWorkOpen ? 'rotate-180' : ''}`} /></button>
              </div>
            </div>
            
            {isWorkOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="max-h-52 overflow-y-auto custom-scrollbar py-1 px-1">
                  {filteredWorkTypes.length > 0 ? (
                    filteredWorkTypes.map((type) => (
                      <button key={type} onClick={() => handleSelectWorkType(type as WorkType)} className={`w-full text-left px-3.5 py-2.5 rounded-lg text-[12px] font-bold flex items-center justify-between transition-all ${state.workType === type ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <span>{type}</span>
                        {state.workType === type && <Check size={14} className="text-blue-600" />}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-6 text-center"><p className="text-[12px] text-gray-400 italic">No matching work types found</p></div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {state.workType && (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-top-4 duration-500">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-1">SELECT WORK CHANNEL</label>
            <div className="grid grid-cols-4 gap-3">
              {SERVICE_MODES.map((opt) => {
                const disabled = isModeDisabled(opt.mode);
                return (
                  <button
                    key={opt.mode}
                    disabled={disabled}
                    onClick={() => !disabled && updateState({ serviceMode: opt.mode })}
                    className={`flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all gap-1.5 relative ${disabled ? 'border-gray-50 bg-gray-50 opacity-40 cursor-not-allowed' : state.serviceMode === opt.mode ? 'border-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-600/10' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${disabled ? 'bg-gray-200 text-gray-400' : state.serviceMode === opt.mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}><opt.icon size={18} /></div>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-bold ${disabled ? 'text-gray-400' : state.serviceMode === opt.mode ? 'text-blue-900' : 'text-gray-900'}`}>{opt.mode}</p>
                      <p className="text-[9px] text-gray-400 truncate mt-0.5">{opt.desc}</p>
                    </div>
                    {state.serviceMode === opt.mode && !disabled && <div className="absolute top-1.5 right-1.5"><Check size={12} className="text-blue-600" /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
