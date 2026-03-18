
import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Users,
  X,
  Info,
  MessageSquare,
  User,
  Calendar as CalendarIcon,
  Package
} from 'lucide-react';
import { SchedulingState, Resource, RecurrenceConfig, WorkType, ServiceMode, ResourceType } from '../../types';
import { MOCK_RESOURCES, TIME_SLOTS } from '../../constants';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
}

const DEFAULT_RECURRENCE: RecurrenceConfig = {
  interval: 1,
  unit: 'week',
  days: ['T'],
  endType: 'after',
  endDate: '',
  occurrences: 6
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getScoreExplanation = (score: number): string => {
  if (score >= 97) return "Aligns best with your objectives — preferred resource is available, travel is minimized, and skill match is excellent.";
  if (score >= 94) return "Near-perfect fit. Preferred resource is free and highly skilled. Travel distance is within the optimal range.";
  if (score >= 91) return "Strong alignment. Preferred resource is available with an excellent skill match. Travel is slightly above minimum.";
  if (score >= 88) return "Very good option. Resource skills meet your requirements and availability is confirmed. Minor travel overhead.";
  if (score >= 75) return "Good fit overall. A well-matched resource is available, though not your preferred one. Travel is reasonable.";
  if (score >= 65) return "Moderate alignment. A capable resource is available but travel distance is higher than preferred slots.";
  if (score >= 60) return "Adequate option. Preferred resource is unavailable at this time and travel overhead is above average.";
  return "Lower alignment due to resource constraints and non-optimal travel distance at this time slot.";
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export const SchedulingStep: React.FC<Props> = ({ state, updateState }) => {
  const [resourceTypeFilter, setResourceTypeFilter] = useState<ResourceType>(ResourceType.PERSON);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const [scoreTooltip, setScoreTooltip] = useState<{ text: string; top: number; right: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize date if not present
  useEffect(() => {
    if (!state.date) {
      updateState({ date: formatDate(new Date(2025, 3, 18)) });
    }
  }, []);

  const currentDate = useMemo(() => {
    try {
      return state.date ? new Date(state.date) : new Date(2025, 3, 18);
    } catch (e) {
      return new Date(2025, 3, 18);
    }
  }, [state.date]);

  const getDefaultRecurrence = (): RecurrenceConfig => ({
    interval: 1,
    unit: 'week',
    days: [DAYS[currentDate.getDay()]],
    endType: 'after',
    endDate: '',
    occurrences: 6,
  });

  const showRecurring =
    state.serviceMode !== ServiceMode.IN_FIELD &&
    (state.schedulingTab === 'SLOTS' || state.resources.length === 1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    updateState({ date: formatDate(newDate) });
  };

  const selectSpecificDate = (date: Date) => {
    updateState({ date: formatDate(date) });
  };

  const filteredResources = useMemo(() => {
    return MOCK_RESOURCES.filter(r => 
      (r.type === resourceTypeFilter) &&
      (r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       r.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, resourceTypeFilter]);

  const toggleResource = (resource: Resource) => {
    const isSelected = state.resources.some(r => r.id === resource.id);
    if (isSelected) {
      removeResource(resource.id);
    } else {
      updateState({
        resources: [...state.resources, resource],
        fastTrackUsed: false,
        date: state.date || 'Fri, April 18, 2025',
        isRecurring: false,
      });
      setSearchTerm('');
    }
  };

  const removeResource = (id: string) => {
    updateState({ 
      resources: state.resources.filter(r => r.id !== id),
      optionalResourceIds: (state.optionalResourceIds || []).filter(oid => oid !== id)
    });
  };

  const toggleOptional = (id: string) => {
    const currentOptional = state.optionalResourceIds || [];
    if (currentOptional.includes(id)) {
      updateState({ optionalResourceIds: currentOptional.filter(oid => oid !== id) });
    } else {
      updateState({ optionalResourceIds: [...currentOptional, id] });
    }
  };

  const updateRecurrence = (updates: Partial<RecurrenceConfig>) => {
    const current = state.recurrenceConfig || DEFAULT_RECURRENCE;
    updateState({ recurrenceConfig: { ...current, ...updates } });
  };

  const toggleDay = (dayIndex: number) => {
    const currentDays = state.recurrenceConfig?.days || DEFAULT_RECURRENCE.days;
    const dayLetter = DAYS[dayIndex];
    const newDays = [...currentDays];
    const existingIndex = newDays.indexOf(dayLetter);
    if (existingIndex > -1) {
      newDays.splice(existingIndex, 1);
    } else {
      newDays.push(dayLetter);
    }
    updateRecurrence({ days: newDays });
  };

  const RecurrencePanel = () => {
    const config = state.recurrenceConfig || DEFAULT_RECURRENCE;
    
    return (
      <div className="p-4 bg-[#f8fafc] rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300 border border-gray-100 shadow-sm mt-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-gray-600">Repeat every</span>
          <div className="flex items-center bg-gray-100 rounded-md px-1 py-0.5">
            <input 
              type="number" 
              className="w-6 bg-transparent text-center text-[12px] font-semibold outline-none"
              value={config.interval}
              onChange={(e) => updateRecurrence({ interval: parseInt(e.target.value) || 1 })}
            />
            <div className="flex flex-col ml-0.5">
              <button onClick={() => updateRecurrence({ interval: config.interval + 1 })}><ChevronUp size={8} className="text-gray-500 hover:text-blue-600" /></button>
              <button onClick={() => updateRecurrence({ interval: Math.max(1, config.interval - 1) })}><ChevronDown size={8} className="text-gray-500 hover:text-blue-600" /></button>
            </div>
          </div>
          <div className="relative">
            <select 
              className="bg-gray-100 pl-2 pr-6 py-1 rounded-md text-[12px] font-medium appearance-none outline-none cursor-pointer hover:bg-gray-200 transition-colors"
              value={config.unit}
              onChange={(e) => updateRecurrence({ unit: e.target.value as any })}
            >
              <option value="day">day</option>
              <option value="week">week</option>
              <option value="month">month</option>
            </select>
            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[12px] font-medium text-gray-600">Repeat on</p>
          <div className="flex gap-1.5">
            {DAYS.map((d, i) => {
              const isSelected = config.days.includes(d);
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#0176d3] text-white shadow-sm' : 'bg-gray-100 text-[#0176d3] hover:bg-gray-200'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[12px] font-medium text-gray-600">Ends</p>
          
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${config.endType === 'never' ? 'border-[#0176d3]' : 'border-gray-400'}`}>
                {config.endType === 'never' && <div className="w-2 h-2 rounded-full bg-[#0176d3]" />}
              </div>
              <input type="radio" className="hidden" name="endType" checked={config.endType === 'never'} onChange={() => updateRecurrence({ endType: 'never' })} />
              <span className={`text-[12px] font-medium transition-colors ${config.endType === 'never' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>Never</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer group shrink-0">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${config.endType === 'on' ? 'border-[#0176d3]' : 'border-gray-400'}`}>
                  {config.endType === 'on' && <div className="w-2 h-2 rounded-full bg-[#0176d3]" />}
                </div>
                <input type="radio" className="hidden" name="endType" checked={config.endType === 'on'} onChange={() => updateRecurrence({ endType: 'on' })} />
                <span className={`text-[12px] font-medium transition-colors ${config.endType === 'on' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>On</span>
              </label>
              <div className={`flex-1 bg-gray-100 rounded-md px-3 py-1 text-[12px] font-medium text-gray-400 ${config.endType !== 'on' && 'opacity-60 cursor-not-allowed'}`}>
                {config.endDate}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer group shrink-0">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${config.endType === 'after' ? 'border-[#0176d3]' : 'border-gray-400'}`}>
                  {config.endType === 'after' && <div className="w-2 h-2 rounded-full bg-[#0176d3]" />}
                </div>
                <input type="radio" className="hidden" name="endType" checked={config.endType === 'after'} onChange={() => updateRecurrence({ endType: 'after' })} />
                <span className={`text-[12px] font-medium transition-colors ${config.endType === 'after' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>After</span>
              </label>
              <div className={`flex flex-1 items-center bg-gray-100 rounded-md px-3 py-1 ${config.endType !== 'after' && 'opacity-60 cursor-not-allowed'}`}>
                <span className="text-[12px] font-medium text-gray-400">{config.occurrences}</span>
                <span className="text-[11px] font-medium text-gray-400 ml-2">occurrences</span>
                <div className="flex flex-col ml-auto">
                   <button onClick={() => updateRecurrence({ occurrences: config.occurrences + 1 })}><ChevronUp size={8} className="text-gray-400 hover:text-blue-600" /></button>
                   <button onClick={() => updateRecurrence({ occurrences: Math.max(1, config.occurrences - 1) })}><ChevronDown size={8} className="text-gray-400 hover:text-blue-600" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DatePicker = () => {
    const [viewDate, setViewDate] = useState(new Date(currentDate));
    
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    
    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const year = viewDate.getFullYear();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      const isSelected = date.toDateString() === currentDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <button
          key={d}
          onClick={() => selectSpecificDate(date)}
          className={`h-8 w-8 rounded-full text-[11px] font-medium flex items-center justify-center transition-all ${
            isSelected 
              ? 'bg-[#0176d3] text-white' 
              : isToday 
                ? 'text-[#0176d3] font-bold border border-[#0176d3]' 
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 w-full animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[13px] font-bold text-gray-800">{monthName} {year}</h4>
          <div className="flex gap-1">
            <button 
              onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-500" />
            </button>
            <button 
              onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const UnifiedSearchBox = () => (
    <div
      className={`relative flex items-stretch bg-white border-2 rounded-xl h-11 overflow-hidden transition-all shadow-sm ${isDropdownOpen ? 'border-[#001639] ring-1 ring-[#001639]' : 'border-gray-200 hover:border-gray-300'}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Type picker dropdown (left side) */}
      <div className="relative shrink-0 self-stretch" ref={typeDropdownRef} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setIsTypeOpen(prev => !prev)}
          className="flex items-center gap-2 px-3 h-full border-r border-gray-100 bg-gray-50/30 hover:bg-gray-100/60 transition-colors"
        >
          <div className="w-5 h-5 bg-[#0176d3] rounded-full flex items-center justify-center text-white shrink-0">
            {resourceTypeFilter === ResourceType.PERSON ? <User size={11} strokeWidth={3} /> : <Package size={11} strokeWidth={3} />}
          </div>
          <span className="text-[13px] font-bold text-gray-700">{resourceTypeFilter === ResourceType.PERSON ? 'People' : 'Assets'}</span>
          <ChevronDown size={14} className={`text-gray-400 ml-0.5 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
        </button>
        {isTypeOpen && (
          <div className="absolute z-[200] top-full left-0 mt-1.5 w-36 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
            {[
              { type: ResourceType.PERSON, icon: <User size={13} />, label: 'People' },
              { type: ResourceType.ASSET, icon: <Package size={13} />, label: 'Assets' },
            ].map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => { setResourceTypeFilter(type); setIsTypeOpen(false); setSearchTerm(''); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-[12px] font-bold transition-colors ${
                  resourceTypeFilter === type ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {icon}
                {label}
                {resourceTypeFilter === type && <Check size={12} className="ml-auto text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center min-w-0 px-3">
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search ${resourceTypeFilter === ResourceType.PERSON ? 'people' : 'assets'}...`}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-[13px]"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
        />
      </div>

      <Search className="text-gray-400 mr-3 shrink-0 self-center" size={16} />

      {/* Dropdown Results */}
      {isDropdownOpen && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-1.5 px-1">
            {filteredResources.length > 0 ? (() => {
              const isSearching = searchTerm.trim().length > 0;
              const isPeople = resourceTypeFilter === ResourceType.PERSON;
              const preferred = isPeople && !isSearching ? filteredResources.slice(0, 3) : filteredResources;
              const rest = isPeople && !isSearching ? filteredResources.slice(3) : [];

              const renderRow = (res: Resource) => {
                const isSelected = state.resources.some(r => r.id === res.id);
                return (
                  <button
                    key={res.id}
                    onClick={(e) => { e.stopPropagation(); toggleResource(res); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <img src={res.avatar} alt={res.name} className="w-7 h-7 rounded-full border shrink-0" />
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-gray-800">{res.name}</p>
                      <p className="text-[10px] text-gray-500">{res.role}</p>
                    </div>
                    {isSelected && <Check size={14} className="text-blue-600" />}
                  </button>
                );
              };

              return (
                <>
                  {isPeople && !isSearching && (
                    <div className="px-2 pt-1 pb-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Preferred Resources</span>
                    </div>
                  )}
                  {preferred.map(renderRow)}
                  {rest.length > 0 && (
                    <>
                      <div className="mx-1 my-1.5 border-t border-gray-100" />
                      <div className="px-2 pb-0.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">All Resources</span>
                      </div>
                      {rest.map(renderRow)}
                    </>
                  )}
                </>
              );
            })() : (
              <div className="px-3 py-3 text-center text-[12px] text-gray-400 italic">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const SelectedResourcesList = () => (
    <div
      className={`space-y-1 mt-2 ${state.resources.length > 4 ? 'max-h-[272px] overflow-y-auto custom-scrollbar pr-1' : ''}`}
    >
      {state.resources.map((res, index) => {
        const isPrimary = index === 0;
        const isOptional = state.optionalResourceIds?.includes(res.id);
        
        return (
          <div 
            key={res.id} 
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group relative"
          >
            <img src={res.avatar} alt={res.name} className="w-10 h-10 rounded-full border border-gray-100" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold text-gray-800 truncate">{res.name}</p>
                {isPrimary && (
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider">Primary</span>
                )}
                {isOptional && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 text-[9px] font-bold uppercase tracking-wider">Optional</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 truncate">{res.role}</p>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isPrimary && (
                <button 
                  onClick={() => toggleOptional(res.id)}
                  className={`p-1.5 rounded-full transition-all ${
                    isOptional ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                  title={isOptional ? "Make Required" : "Make Optional"}
                >
                  <User size={16} />
                </button>
              )}
              <button 
                onClick={() => removeResource(res.id)}
                className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const isBreakFix = state.workType === WorkType.BREAK_FIX;
  const isBloodTest = state.workType === WorkType.BLOOD_TEST;

  const bloodTestSlots = useMemo(() => {
    if (!isBloodTest) return TIME_SLOTS;
    const slots = [];
    let current = new Date();
    current.setHours(8, 0, 0, 0);
    const end = new Date();
    end.setHours(20, 0, 0, 0);
    while (current <= end) {
      slots.push(current.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      current.setMinutes(current.getMinutes() + 10);
    }
    return slots;
  }, [isBloodTest]);

  const SlotGrid = ({ slots, title, date }: { slots: string[], title?: string, date?: string }) => {
    const getEndTime = (startTime: string) => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const dateObj = new Date();
      dateObj.setHours(hours, minutes, 0, 0);
      const duration = isBreakFix ? 120 : (isBloodTest ? 10 : 30);
      dateObj.setMinutes(dateObj.getMinutes() + duration);
      return dateObj.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    const displayTitle = isBreakFix 
      ? (title === 'GOLDEN SLOTS' ? 'GOLDEN ARRIVAL WINDOWS' : 'OTHER ARRIVAL WINDOWS')
      : title;

    return (
      <div className="space-y-3">
        {displayTitle && (
          <div className="flex items-center gap-2 px-1">
            {displayTitle.includes('GOLDEN') && <Sparkles size={12} className="text-amber-500 fill-amber-500/20" />}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{displayTitle}</p>
          </div>
        )}
        {date && (
          <p className="text-[11px] font-bold text-gray-600 px-1 mb-1">{date}</p>
        )}
        <div className="space-y-2">
          {slots.map((time, idx) => {
            const isSelected = state.timeSlot.startsWith(time) && (date ? state.date === date : true);
            // Mock score for slots
            const score = title === 'GOLDEN SLOTS' ? (98 - idx * 2) : (62 - idx * 1);
            const isGolden = title === 'GOLDEN SLOTS';
            
            return (
              <div key={time} className="space-y-3">
                <button
                  onClick={() => updateState({
                    date: date || state.date || formatDate(new Date(2025, 3, 18)),
                    timeSlot: `${time} - ${getEndTime(time)}`
                  })}
                  className={`w-full px-4 py-3 rounded-xl text-[13px] font-bold transition-all border-2 flex items-center justify-between ${
                    isSelected
                    ? 'bg-[#0176d3] border-[#0176d3] text-white shadow-md'
                    : 'bg-white border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={14} className={isSelected ? 'text-white' : 'text-gray-400'} />
                    <span>{time} {(isBreakFix || isBloodTest) && `- ${getEndTime(time)}`}</span>
                  </div>
                  <span
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setScoreTooltip({
                        text: getScoreExplanation(score),
                        top: rect.top,
                        right: window.innerWidth - rect.right,
                      });
                    }}
                    onMouseLeave={() => setScoreTooltip(null)}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isGolden
                          ? 'bg-green-50 text-green-600'
                          : 'bg-orange-50 text-orange-600'
                    }`}
                  >
                    {score}/100
                  </span>
                </button>

                {isSelected && showRecurring && (
                <div className="px-1 pb-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2.5 py-1">
                    <div
                      onClick={() => {
                        if (!state.isRecurring) {
                          updateState({ isRecurring: true, recurrenceConfig: getDefaultRecurrence() });
                        } else {
                          updateState({ isRecurring: false });
                        }
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                        state.isRecurring ? 'bg-[#0176d3] border-[#0176d3]' : 'bg-white border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {state.isRecurring && <Check size={14} strokeWidth={4} className="text-white" />}
                    </div>
                    <span
                      className="text-[13px] font-bold text-gray-700 cursor-pointer select-none"
                      onClick={() => {
                        if (!state.isRecurring) {
                          updateState({ isRecurring: true, recurrenceConfig: getDefaultRecurrence() });
                        } else {
                          updateState({ isRecurring: false });
                        }
                      }}
                    >
                      Make recurring
                    </span>
                  </div>

                  {state.isRecurring && (
                    <div className="mt-3">
                      <RecurrencePanel />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

  const InfoBubble = () => {
    if (state.schedulingTab !== 'SLOTS' && state.resources.length <= 1 && !state.isRecurring) return null;
    
    return (
      <div className="bg-[#f0f9ff]/95 border border-[#dbeafe] p-4 rounded-xl flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
        <Info size={16} className="text-[#0070d2] shrink-0 mt-0.5" />
        <div className="space-y-1">
          {state.schedulingTab === 'SLOTS' ? (
            <p className="text-[11px] font-medium text-[#0070d2] leading-tight">
              Service resource will be assigned based on availability for the preferred slot
            </p>
          ) : state.resources.length > 1 && (
            <p className="text-[11px] font-medium text-[#0070d2] leading-tight">
              Common slots available for all selected resources and assets
            </p>
          )}
          {state.isRecurring && (
            <p className="text-[11px] font-medium text-[#0070d2] leading-tight">
              {state.schedulingTab === 'RESOURCES'
                ? "Your selected resource will be available for 5 out of 6 appointments. An alternative resource will be assigned for the remaining appointments."
                : "We'll try to assign the same resource each session, but this can't always be guaranteed."}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
    <div className="flex h-full animate-in fade-in duration-300">
      {/* Vertical Tabs Sidebar */}
      <div className="w-[240px] border-r border-gray-100 pr-6 flex flex-col gap-2 shrink-0">
        <button 
          onClick={() => {
            setSearchTerm('');
            setResourceTypeFilter(ResourceType.PERSON);
            updateState({ 
              schedulingTab: 'SLOTS',
              resources: [], 
              optionalResourceIds: [],
              timeSlot: '', 
              isRecurring: false 
            });
          }}
          className={`w-full text-left px-4 py-4 rounded-xl text-[11px] font-bold transition-all flex items-center gap-3 ${
            state.schedulingTab === 'SLOTS' 
            ? 'bg-blue-50 text-[#0176d3] shadow-sm ring-1 ring-blue-100' 
            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
          }`}
        >
          <CalendarIcon size={16} />
          {isBreakFix ? 'BY AVAILABLE ARRIVAL WINDOWS' : 'BY AVAILABLE SLOTS'}
        </button>
        <button 
          onClick={() => {
            setSearchTerm('');
            setResourceTypeFilter(ResourceType.PERSON);
            updateState({ 
              schedulingTab: 'RESOURCES',
              resources: [], 
              optionalResourceIds: [],
              timeSlot: '', 
              isRecurring: false 
            });
          }}
          className={`w-full text-left px-4 py-4 rounded-xl text-[11px] font-bold transition-all flex items-center gap-3 ${
            state.schedulingTab === 'RESOURCES' 
            ? 'bg-blue-50 text-[#0176d3] shadow-sm ring-1 ring-blue-100' 
            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
          }`}
        >
          <Users size={16} />
          BY REQUIRED RESOURCES
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 pl-10 overflow-y-auto custom-scrollbar">
        {state.schedulingTab === 'SLOTS' ? (
          /* SLOTS TAB */
          <div className="animate-in slide-in-from-left-2 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div className="sticky top-0">
                <DatePicker />
                <InfoBubble />
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <SlotGrid 
                    slots={bloodTestSlots.slice(0, 3)} 
                    title="GOLDEN SLOTS" 
                    date={state.date || formatDate(new Date(2025, 3, 18))}
                  />
                  <SlotGrid 
                    slots={bloodTestSlots.slice(3, 12)} 
                    title="OTHER OPTIONS" 
                    date={state.date || formatDate(new Date(2025, 3, 18))}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* RESOURCES TAB */
          <div className="animate-in slide-in-from-right-2 pb-16 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch h-full">
              <div className="space-y-5 sticky top-0">
                {/* Unified Search Box - Always shown */}
                <div className="px-1" ref={dropdownRef}>
                  <UnifiedSearchBox />
                  <SelectedResourcesList />
                </div>

                {state.resources.length > 0 && (
                  <div className="space-y-5 mt-5 animate-in slide-in-from-top-2">
                    <DatePicker />
                    <InfoBubble />
                  </div>
                )}
              </div>

              {/* Selection Area */}
              <div className="flex flex-col h-full pt-1">
                {state.resources.length === 0 ? (
                  <div className="flex-1 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3">
                    <div className="bg-gray-50 p-4 rounded-full">
                      <Users size={40} className="text-gray-200" />
                    </div>
                    <p className="text-[14px] font-bold text-gray-400">Assign resources to view shared slots</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-top-2">
                    <SlotGrid 
                      slots={bloodTestSlots.slice(0, 3)} 
                      title="GOLDEN SLOTS" 
                      date={state.date || formatDate(new Date(2025, 3, 18))}
                    />
                    <SlotGrid 
                      slots={bloodTestSlots.slice(3, 12)} 
                      title="OTHER OPTIONS" 
                      date={state.date || formatDate(new Date(2025, 3, 18))}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Score tooltip portal — renders at body level to escape scroll container clipping */}
    {scoreTooltip && ReactDOM.createPortal(

      <div
        className="pointer-events-none fixed w-64 px-3 py-2.5 bg-[#032D60] text-white text-[11px] font-medium rounded-xl shadow-xl z-[9999] text-left leading-relaxed"
        style={{
          top: scoreTooltip.top,
          right: scoreTooltip.right,
          transform: 'translateY(calc(-100% - 8px))',
        }}
      >
        {scoreTooltip.text}
        <span className="absolute top-full right-3 -mt-[1px] border-[6px] border-transparent border-t-[#032D60] block" />
      </div>,
      document.body
    )}
    </>
  );
};
