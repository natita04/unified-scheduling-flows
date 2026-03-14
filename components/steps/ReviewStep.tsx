
import React, { useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Wrench, 
  Zap, 
  UserCheck, 
  Phone, 
  Video, 
  Building2, 
  Activity,
  ExternalLink,
  Link as LinkIcon,
  UserMinus,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { SchedulingState, ServiceMode, ResourceType, WorkType } from '../../types';
import { MOCK_RESOURCES } from '../../constants';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
}

export const ReviewStep: React.FC<Props> = ({ state, updateState }) => {
  // Randomly pick a resource if none was selected manually
  const autoResource = useMemo(() => {
    const fieldTechs = MOCK_RESOURCES.filter(r => r.role === 'Field Technician');
    const randomIndex = Math.floor(Math.random() * fieldTechs.length);
    return fieldTechs[randomIndex]?.name || 'Brooke Weaver';
  }, []);

  const SummaryItem = ({ icon: Icon, label, value, color, isLink, fullWidth }: { icon: any, label: string, value: string, color: string, isLink?: boolean, fullWidth?: boolean }) => (
    <div className={`flex gap-3.5 p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md ${fullWidth ? 'col-span-full' : ''}`}>
      <div className={`${color} bg-opacity-10 p-2 rounded-lg shrink-0`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        {isLink ? (
          <a href="#" onClick={(e) => e.preventDefault()} className="text-[13px] font-bold text-blue-600 flex items-center gap-1 hover:underline truncate">
            {value}
            <ExternalLink size={11} className="shrink-0" />
          </a>
        ) : (
          <p className="text-[13px] font-semibold text-gray-800 break-words leading-snug">{value}</p>
        )}
      </div>
    </div>
  );

  const getModeDetails = () => {
    const customerName = state.customers[0]?.name || 'Customer';
    const customerAddress = state.customers[0]?.address || 'Primary Service Address';

    switch (state.serviceMode) {
      case ServiceMode.PHONE:
        return {
          label: 'Communication Details',
          value: `Technician will call ${customerName} at +1 (555) 235-8592`,
          icon: Phone,
          color: 'text-blue-500',
          isLink: false
        };
      case ServiceMode.VIDEO:
        return {
          label: 'Session Link',
          value: 'https://zoom.us/j/84291039452',
          icon: Video,
          color: 'text-indigo-500',
          isLink: true
        };
      case ServiceMode.IN_FIELD:
        return {
          label: 'Customer Address',
          value: customerAddress,
          icon: MapPin,
          color: 'text-red-500',
          isLink: false
        };
      case ServiceMode.ONSITE:
        return {
          label: 'Branch Location',
          value: state.location || 'Branch Office',
          icon: Building2,
          color: 'text-orange-500',
          isLink: false
        };
      default:
        return {
          label: 'Location',
          value: state.location || 'Not Specified',
          icon: MapPin,
          color: 'text-gray-500',
          isLink: false
        };
    }
  };

  const modeInfo = getModeDetails();
  const ModeIcon = modeInfo.icon;

  const resourceDisplay = state.resources.length > 0 
    ? state.resources.map(r => r.name).join(', ') 
    : `${autoResource} (Auto-assigned)`;

  const people = state.resources.filter(r => r.type === ResourceType.PERSON);
  const assets = state.resources.filter(r => r.type === ResourceType.ASSET);

  return (
    <div className="flex flex-col min-h-[calc(100vh-200px)] animate-in slide-in-from-right-4 duration-300">
      <div className="flex-1 space-y-5 pb-6">
        <div className="space-y-2">
          {state.fastTrackUsed && (
            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 p-2.5 rounded-lg border border-yellow-200 text-[11px] font-bold shadow-sm">
               <Zap size={12} className="fill-yellow-500 text-yellow-500" />
               Optimized via Fast Track booking
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryItem 
            icon={Wrench} 
            label="Work Type" 
            value={state.workType || 'N/A'} 
            color="text-purple-600" 
          />
          
          <SummaryItem 
            icon={Activity} 
            label="Appointment Type" 
            value={state.serviceMode || 'N/A'} 
            color="text-emerald-600" 
          />

          <SummaryItem 
            icon={Users} 
            label="Customer" 
            value={state.customers.map(c => c.name).join(', ')} 
            color="text-blue-600" 
          />

          <SummaryItem 
            icon={ModeIcon} 
            label={modeInfo.label} 
            value={modeInfo.value} 
            color={modeInfo.color}
            isLink={modeInfo.isLink}
          />

          {people.length > 0 ? (
            <SummaryItem 
              icon={UserCheck} 
              label="Assigned People" 
              value={people.map((p, idx) => {
                const isOptional = state.optionalResourceIds.includes(p.id);
                const tag = isOptional ? '(Optional)' : (idx === 0 ? '(Primary)' : '');
                return `${p.name} ${tag}`.trim();
              }).join(', ')} 
              color="text-sky-600" 
            />
          ) : state.resources.length === 0 ? (
            <SummaryItem 
              icon={UserCheck} 
              label="Assigned People" 
              value={`${autoResource} (Auto-assigned)`} 
              color="text-sky-600" 
            />
          ) : null}

          {assets.length > 0 ? (
            <SummaryItem 
              icon={Zap} 
              label="Assigned Assets" 
              value={assets.map(a => a.name).join(', ')} 
              color="text-amber-600" 
            />
          ) : (
            <div className="hidden md:block" /> // Spacer to keep alignment if no assets
          )}

          {(() => {
            const [startTime, endTime] = (state.timeSlot || 'N/A - N/A').split(' - ');
            const dateStr = state.date || 'N/A';
            const isBreakFix = state.workType === WorkType.BREAK_FIX;
            const isBloodTest = state.workType === WorkType.BLOOD_TEST;
            return (
              <>
                <SummaryItem 
                  icon={Clock} 
                  label={isBreakFix ? "Arrival Window Start" : "Scheduled Start"} 
                  value={`${dateStr} at ${startTime}`} 
                  color="text-green-600" 
                />
                <SummaryItem 
                  icon={Clock} 
                  label={isBreakFix ? "Arrival Window End" : "Scheduled End"} 
                  value={`${dateStr} at ${endTime}`} 
                  color="text-green-600" 
                />
                {isBloodTest && (
                  <>
                    <SummaryItem 
                      icon={Clock} 
                      label="Blocked Time Before" 
                      value="5 minutes" 
                      color="text-slate-600" 
                    />
                    <SummaryItem 
                      icon={Clock} 
                      label="Blocked Time After" 
                      value="5 minutes" 
                      color="text-slate-600" 
                    />
                  </>
                )}
              </>
            );
          })()}

          {(state.minParticipantsEnabled || state.maxParticipantsEnabled) && (
            <div className="grid grid-cols-2 gap-4 col-span-full">
              {state.minParticipantsEnabled && (
                <SummaryItem 
                  icon={UserMinus} 
                  label="Min Participants" 
                  value={state.minParticipants?.toString() || '1'} 
                  color="text-slate-600" 
                />
              )}
              {state.maxParticipantsEnabled && (
                <SummaryItem 
                  icon={UserPlus} 
                  label="Max Participants" 
                  value={state.maxParticipants?.toString() || '10'} 
                  color="text-slate-600" 
                />
              )}
            </div>
          )}

          {state.isOpenForSigning && (
            <SummaryItem 
              icon={LinkIcon} 
              label="Public Signup Link" 
              value="https://portal.dispatch.pro/signup/SA-77291" 
              color="text-blue-600"
              isLink={true}
              fullWidth={true}
            />
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white pt-4 pb-2">
        <div className="p-4 bg-[#f0f9ff] border border-[#dbeafe] rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="shrink-0 p-1.5 bg-white rounded-lg shadow-xs border border-blue-50">
            <MessageSquare size={16} className="text-[#2563eb]" />
          </div>
          <p className="text-[#1d4ed8] text-[11px] font-medium leading-relaxed">
            Upon scheduling, your customer will be notified via SMS.
          </p>
        </div>
      </div>
    </div>
  );
};
