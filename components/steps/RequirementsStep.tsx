
import React, { useState } from 'react';
import { 
  Settings2, 
  Mail, 
  Plus, 
  X, 
  Users, 
  Link, 
  HelpCircle 
} from 'lucide-react';
import { SchedulingState } from '../../types';

interface Props {
  state: SchedulingState;
  updateState: (updates: Partial<SchedulingState>) => void;
}

export const RequirementsStep: React.FC<Props> = ({ state, updateState }) => {
  const [emailInput, setEmailInput] = useState('');

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

  return (
    <div className="space-y-7 animate-in slide-in-from-right-4 duration-300 pb-8">
      {/* ATTENDEE LIMITS */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-1">
          ATTENDEE LIMITS
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={state.minParticipantsEnabled} 
                onChange={(e) => updateState({ minParticipantsEnabled: e.target.checked })} 
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[13px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Min attendees</span>
            </label>
            {state.minParticipantsEnabled && (
              <input 
                type="number" 
                min="1" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-bold text-center focus:border-blue-500 focus:bg-white outline-none transition-all animate-in slide-in-from-top-1" 
                value={state.minParticipants || 1} 
                onChange={(e) => updateState({ minParticipants: parseInt(e.target.value) || 1 })} 
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={state.maxParticipantsEnabled} 
                onChange={(e) => updateState({ maxParticipantsEnabled: e.target.checked })} 
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[13px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Max attendees</span>
            </label>
            {state.maxParticipantsEnabled && (
              <input 
                type="number" 
                min="1" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-bold text-center focus:border-blue-500 focus:bg-white outline-none transition-all animate-in slide-in-from-top-1" 
                value={state.maxParticipants || 10} 
                onChange={(e) => updateState({ maxParticipants: parseInt(e.target.value) || 10 })} 
              />
            )}
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* GUEST INVITATIONS */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-1">
          GUEST INVITATIONS
        </label>
        
        <div className="space-y-3">
          <label className="text-[13px] font-bold text-gray-600 block px-1">Invite internal guests</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="email" 
                placeholder="guest@example.com"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-[13px]"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
            <button 
              onClick={addEmail} 
              className="px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {state.additionalEmails && state.additionalEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {state.additionalEmails.map(email => (
                <div key={email} className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-[11px] font-bold text-blue-700 flex items-center gap-2 animate-in zoom-in-95">
                  {email}
                  <button onClick={() => removeEmail(email)} className="text-blue-400 hover:text-blue-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users size={18} className="text-gray-500" />
              </div>
              <span className="text-[13px] font-bold text-gray-700">Allow external guests</span>
            </div>
            <input 
              type="checkbox" 
              checked={state.allowExternalGuests} 
              onChange={(e) => {
                const checked = e.target.checked;
                updateState({ 
                  allowExternalGuests: checked,
                  isOpenForSigning: checked ? state.isOpenForSigning : false
                });
              }} 
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className={`flex items-center justify-between px-1 transition-all ${!state.allowExternalGuests ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Link size={18} className="text-gray-500" />
              </div>
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
            <input 
              type="checkbox" 
              disabled={!state.allowExternalGuests}
              checked={state.isOpenForSigning} 
              onChange={(e) => updateState({ isOpenForSigning: e.target.checked })} 
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
