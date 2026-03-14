
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Settings, Bell, HelpCircle, User, Grid, Star, ChevronDown, 
  Plus, Layout, Mountain, Briefcase, MapPin, Building2, Phone, 
  Mail, Calendar, Clock, CheckCircle2, MoreHorizontal, X, 
  ExternalLink, FileText, Trash2, Share2, Printer, Tag, Network,
  UserPlus, MessageSquare, History, Check, Shield
} from 'lucide-react';
import { SchedulingModal } from './components/SchedulingModal';
import { SchedulingState } from './types';

const App: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ name: '', time: '' });
  const [activeTab, setActiveTab] = useState('Details');
  const [activeRightTab, setActiveRightTab] = useState('Activity');
  const actionMenuTriggerRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Calculate menu position relative to the trigger button
  useLayoutEffect(() => {
    if (isActionMenuOpen && actionMenuTriggerRef.current) {
      const rect = actionMenuTriggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX
      });
    }
  }, [isActionMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isActionMenuOpen && actionMenuTriggerRef.current && !actionMenuTriggerRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionMenuOpen]);

  const handleScheduleComplete = (state: SchedulingState) => {
    setIsPanelOpen(false);
    
    // Extract data for the toast
    const resourceName = state.resources.length > 0 ? state.resources[0].name : 'Technician';
    // Extract just the start time (e.g. "08:00") from "08:00 AM - 09:00 AM" or similar
    const startTime = state.timeSlot.split(' ')[0] || '09:30';
    
    setToastData({ name: resourceName, time: startTime });
    
    // Show confirmation toast
    setShowToast(true);
    // Auto-dismiss after 6 seconds
    setTimeout(() => setShowToast(false), 6000);
  };

  const openSchedulingFlow = () => {
    setIsPanelOpen(true);
    setIsActionMenuOpen(false);
  };

  const ActionMenu = () => {
    const menuContent = (
      <div 
        className="fixed bg-white rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-gray-300 py-2 z-[10000] animate-in fade-in slide-in-from-top-1 duration-150 origin-top-right w-[280px]"
        style={{ 
          top: `${menuPosition.top + 4}px`, 
          left: `${menuPosition.left - 280}px` 
        }}
        onMouseDown={(e) => e.stopPropagation()} // Prevent handleOutsideClick from catching this
      >
        {[
          'New Note',
          'New Opportunity',
          'Change Owner',
          'Delete',
          'View Account Hierarchy',
          'Sharing',
          'Sharing Hierarchy',
          'Check for New Data',
          'Printable View',
          'Edit Labels',
          'View Relationship Map',
        ].map((label, idx) => (
          <button 
            key={label} 
            className={`w-full text-left px-5 py-2.5 text-[14px] leading-tight transition-colors flex items-center ${
              idx === 0 ? 'bg-[#e0efff] text-black' : 'text-black hover:bg-[#f3f3f3]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    );

    return createPortal(menuContent, document.body);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col font-sans text-slate-800">
      {/* Salesforce Global Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-between h-12 z-40">
        <div className="flex items-center gap-4 shrink-0">
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" className="w-12 h-8" alt="Salesforce Logo" />
        </div>

        <div className="flex-1 flex justify-center max-w-2xl px-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm" 
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-600 shrink-0">
          <div className="flex items-center gap-0.5 border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-100 cursor-pointer transition-colors">
            <Star size={16} />
            <ChevronDown size={12} />
          </div>
          <div className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"><Plus size={18} /></div>
          <div className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"><Mountain size={18} /></div>
          <div className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"><HelpCircle size={18} /></div>
          <div className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"><Settings size={18} /></div>
          <div className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors relative"><Bell size={18} /></div>
          <div className="w-8 h-8 rounded-full bg-[#001639] flex items-center justify-center cursor-pointer border border-gray-200 text-white shadow-sm hover:ring-2 hover:ring-blue-500/20 transition-all">
             <User size={18} />
          </div>
        </div>
      </header>

      {/* Main Nav Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 h-10 flex items-center z-30 shadow-sm overflow-x-auto no-scrollbar">
        {/* App Branding Identity */}
        <div className="flex items-center gap-2 mr-6 shrink-0 cursor-pointer group h-full">
          <div className="text-gray-500 group-hover:text-blue-600 transition-colors">
            <Grid size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[16px] font-bold text-[#001639] whitespace-nowrap tracking-tight">Field Service</span>
        </div>

        <div className="flex items-center gap-6 h-full">
          {[
            'Home', 'Analytics', 'Opportunities', 'Leads', 'Tasks', 'Files', 'Accounts', 'Contacts', 'Dashboards', 'Reports', 'Chatter'
          ].map((tab) => (
            <div 
              key={tab} 
              className={`flex items-center gap-1 cursor-pointer h-full px-1 text-[13px] font-semibold transition-all shrink-0 relative ${
                tab === 'Accounts' ? 'text-[#0176d3] border-b-[3px] border-[#0176d3]' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {tab} {['Opportunities', 'Leads', 'Tasks', 'Accounts', 'Contacts', 'Dashboards', 'Reports'].includes(tab) && <ChevronDown size={12} className="ml-0.5 opacity-60" />}
            </div>
          ))}
        </div>
      </nav>

      {/* Account Record Header */}
      <div className="bg-white px-6 py-5 flex flex-col border-b border-gray-200 relative z-20">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#7f8de1] rounded flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Account</p>
              <h1 className="text-2xl font-bold text-[#001639] tracking-tight leading-none">Acme</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-300 bg-white rounded-md text-gray-600 hover:bg-gray-50 shadow-sm transition-all"><Network size={16} /></button>
            <button className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 bg-white text-blue-600 text-[14px] font-semibold hover:bg-gray-50 rounded-md shadow-sm transition-all">
               <Plus size={14} /> Follow
            </button>
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm overflow-hidden bg-white">
               <button className="px-4 py-1.5 bg-white text-blue-600 text-[14px] font-semibold hover:bg-gray-50 border-r border-gray-300 transition-colors">Edit</button>
               <button className="px-4 py-1.5 bg-white text-blue-600 text-[14px] font-semibold hover:bg-gray-50 border-r border-gray-300 transition-colors">New Contact</button>
               <button 
                 onClick={openSchedulingFlow}
                 className="px-4 py-1.5 bg-white text-blue-600 text-[14px] font-semibold hover:bg-gray-50 transition-colors"
               >
                 Schedule Appointment
               </button>
               <div className="relative h-full flex items-center" ref={actionMenuTriggerRef}>
                 <button 
                   onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                   className={`h-full px-2 transition-all border-l border-gray-300 flex items-center justify-center ${isActionMenuOpen ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                 >
                   <ChevronDown size={16} className={`transition-transform duration-200 ${isActionMenuOpen ? 'rotate-180' : ''}`} />
                 </button>
                 {isActionMenuOpen && <ActionMenu />}
               </div>
            </div>
          </div>
        </div>

        {/* Record Highlights Strip */}
        <div className="grid grid-cols-6 gap-x-8">
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Type</p>
            <p className="text-[13px] text-gray-800 font-medium">Prospect</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Phone</p>
            <p className="text-[13px] text-blue-600 hover:underline cursor-pointer font-medium">(212) 555-5555</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Website</p>
            <p className="text-[13px] text-gray-800 font-medium">-</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Account Owner</p>
            <div className="flex items-center gap-1.5">
               <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center"><User size={10} className="text-blue-600" /></div>
               <p className="text-[13px] text-blue-600 hover:underline cursor-pointer font-medium">Admin User</p>
               <UserPlus size={12} className="text-blue-500 ml-1" />
            </div>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Industry</p>
            <p className="text-[13px] text-gray-800 font-medium">Manufacturing</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Billing Address</p>
            <p className="text-[13px] text-blue-600 hover:underline cursor-pointer font-medium leading-tight">
               10 Main Rd.<br />New York, NY 31349<br />USA
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4 bg-[#f3f3f3] relative z-10">
        {/* Account Tabs Section (Left 2/3) */}
        <div className="flex-[2] bg-white rounded-md border border-gray-200 flex flex-col shadow-sm">
           <div className="flex border-b border-gray-200 shrink-0">
              {['Related', 'Details'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-[14px] font-bold transition-all relative ${
                    activeTab === tab ? 'text-[#0176d3]' : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0176d3]" />}
                </button>
              ))}
           </div>
           
           <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              {activeTab === 'Details' ? (
                <div className="space-y-12 max-w-5xl">
                  <div className="grid grid-cols-2 gap-x-20 gap-y-6">
                    {[
                      { label: 'Account Owner', value: 'Admin User', type: 'owner' },
                      { label: 'Phone', value: '(212) 555-5555', type: 'link' },
                      { label: 'Account Name', value: 'Acme' },
                      { label: 'Fax', value: '(212) 555-5555', type: 'link' },
                      { label: 'Parent Account', value: '' },
                      { label: 'Website', value: '', type: 'link' },
                    ].map((field, i) => (
                      <div key={i} className="group border-b border-gray-200 pb-2 flex justify-between items-end min-h-[48px] hover:border-[#0176d3]/30 transition-colors">
                        <div>
                          <p className="text-[12px] text-gray-500 font-medium mb-1">{field.label}</p>
                          {field.type === 'owner' ? (
                            <div className="flex items-center gap-2">
                               <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center"><User size={10} className="text-blue-600" /></div>
                               <p className="text-[13px] text-blue-600 hover:underline cursor-pointer font-medium">Admin User</p>
                               <UserPlus size={12} className="text-blue-500 ml-1" />
                            </div>
                          ) : field.type === 'link' ? (
                            <p className="text-[13px] text-blue-600 hover:underline cursor-pointer font-medium">{field.value || '-'}</p>
                          ) : (
                            <p className="text-[13px] text-gray-900 font-semibold">{field.value || '-'}</p>
                          )}
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#0176d3] transition-all hover:bg-gray-100 rounded"><Settings size={14} /></button>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                     <button className="flex items-center gap-2 text-[#00396b] font-bold text-[15px] mb-8 hover:underline">
                        <ChevronDown size={16} /> Additional Information
                     </button>
                     <div className="grid grid-cols-2 gap-x-20 gap-y-6">
                        {[
                          { label: 'Type', value: 'Prospect' },
                          { label: 'Employees', value: '680' },
                          { label: 'Industry', value: 'Manufacturing' },
                          { label: 'Annual Revenue', value: '$100,000,000' },
                          { label: 'Description', value: '' },
                        ].map((field, i) => (
                          <div key={i} className={`group border-b border-gray-200 pb-2 flex justify-between items-end min-h-[48px] hover:border-[#0176d3]/30 transition-colors ${field.label === 'Description' ? 'col-span-full' : ''}`}>
                            <div>
                              <p className="text-[12px] text-gray-500 font-medium mb-1">{field.label}</p>
                              <p className="text-[13px] text-gray-900 font-semibold">{field.value || '-'}</p>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#0176d3] transition-all hover:bg-gray-100 rounded"><Settings size={14} /></button>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                   <Layout size={48} className="opacity-20 mb-4" />
                   <p className="text-sm font-medium">No related lists to display.</p>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar (Right 1/3) */}
        <div className="flex-1 bg-white rounded-md border border-gray-200 flex flex-col shadow-sm max-w-md">
           <div className="flex border-b border-gray-200 shrink-0">
              {['Activity', 'Chatter'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveRightTab(tab)}
                  className={`px-6 py-3 text-[14px] font-bold transition-all relative ${
                    activeRightTab === tab ? 'text-[#0176d3]' : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  {tab}
                  {activeRightTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0176d3]" />}
                </button>
              ))}
           </div>

           <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-white">
              <div className="flex items-center gap-3 mb-6">
                 <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                    <button className="p-2.5 bg-[#1b96ff] text-white hover:bg-[#0176d3] transition-colors"><CheckCircle2 size={18} /></button>
                    <button className="p-2 border-l border-gray-300 hover:bg-gray-50 text-gray-500 transition-colors"><ChevronDown size={14} /></button>
                 </div>
                 <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                    <button className="p-2.5 bg-white text-gray-600 hover:bg-gray-50 transition-colors"><Calendar size={18} /></button>
                    <button className="p-2 border-l border-gray-300 hover:bg-gray-50 text-gray-500 transition-colors"><ChevronDown size={14} /></button>
                 </div>
                 <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                    <button className="p-2.5 bg-white text-gray-600 hover:bg-gray-50 transition-colors"><Mail size={18} /></button>
                    <button className="p-2 border-l border-gray-300 hover:bg-gray-50 text-gray-500 transition-colors"><ChevronDown size={14} /></button>
                 </div>
                 <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                    <button className="p-2.5 bg-white text-gray-600 hover:bg-gray-50 transition-colors"><Phone size={18} /></button>
                    <button className="p-2 border-l border-gray-300 hover:bg-gray-50 text-gray-500 transition-colors"><ChevronDown size={14} /></button>
                 </div>
              </div>

              <div className="text-[12px] text-gray-500 mb-5 text-center px-4 py-2 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center gap-2">
                 <span>Filters: All time • All activities • All types</span>
                 <button className="p-1 rounded hover:bg-gray-200 transition-colors"><Settings size={14} /></button>
              </div>

              <div className="flex items-center justify-center gap-5 text-[#0176d3] text-[13px] font-bold mb-8">
                 <button className="hover:underline">Refresh</button>
                 <span className="text-gray-300 font-normal">|</span>
                 <button className="hover:underline">Expand All</button>
                 <span className="text-gray-300 font-normal">|</span>
                 <button className="hover:underline">View All</button>
              </div>

              <div className="bg-[#f3f3f3] rounded-md p-2.5 flex items-center gap-2 mb-6 border border-gray-200 shadow-sm">
                 <ChevronDown size={16} className="text-gray-500" />
                 <span className="text-[13px] font-bold text-gray-700">Upcoming & Overdue</span>
              </div>

              <div className="text-center py-12 px-6">
                 <p className="text-[14px] text-gray-600 font-medium mb-1">No activities found.</p>
                 <p className="text-[12px] text-gray-400 leading-relaxed">Schedule a task or send an email to see activity here.</p>
              </div>

              <hr className="border-gray-200 my-6" />
              
              <div className="text-center text-[13px] text-gray-500 py-6 font-medium">
                 Past meetings and tasks marked as done show up here.
              </div>
           </div>
        </div>
      </main>

      {/* Modal Scheduling Flow */}
      <SchedulingModal isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} onFinish={handleScheduleComplete} />
      
      {/* Confirmation Toast Notification - Top Floating Position */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10001] animate-in slide-in-from-top-6 duration-500">
          <div className="bg-[#dcfce7] border border-[#bbf7d0] shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-xl px-4 py-2.5 flex items-center gap-4 min-w-[400px]">
            <div className="bg-[#16a34a] text-white p-1 rounded-full shadow-sm flex items-center justify-center">
              <Check size={16} strokeWidth={3} />
            </div>
            <p className="flex-1 text-[15px] font-medium text-[#166534] leading-tight">
              The appointment was scheduled to {toastData.name} at {toastData.time}.
            </p>
            <button 
              onClick={() => setShowToast(false)} 
              className="p-1 text-[#166534] hover:bg-green-200/50 rounded-md transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
