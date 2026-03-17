
import React, { useState } from 'react';
import { X, ChevronLeft, AlertTriangle, Info } from 'lucide-react';
import { Step, SchedulingState, ServiceMode, WorkType, Resource } from '../types';
import { STEP_LABELS, MOCK_CUSTOMERS } from '../constants';
import { CustomerStep } from './steps/CustomerStep';
import { LocationStep } from './steps/LocationStep';
import { SchedulingStep } from './steps/SchedulingStep';
import { ReviewStep } from './steps/ReviewStep';

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: (state: SchedulingState) => void;
}

const INITIAL_STATE: SchedulingState = {
  isMultiCustomer: false,
  // Defaulting to the first customer (Acme Corp) as requested
  customers: [MOCK_CUSTOMERS[0]],
  isOpenForSigning: false,
  workType: WorkType.GENERAL,
  serviceMode: ServiceMode.ONSITE,
  resources: [],
  optionalResourceIds: [],
  location: '',
  radius: '10 miles',
  date: '',
  timeSlot: '',
  schedulingTab: 'SLOTS',
  isRecurring: false,
  fastTrackUsed: false,
  minParticipants: 1,
  maxParticipants: 10,
  minParticipantsEnabled: false,
  maxParticipantsEnabled: false,
  isMultiResource: false,
  additionalEmails: [],
};

export const SchedulingModal: React.FC<SchedulingModalProps> = ({ isOpen, onClose, onFinish }) => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.CUSTOMER_AND_WORK);
  const [state, setState] = useState<SchedulingState>(INITIAL_STATE);

  const handleNext = () => {
    let nextStep = currentStep + 1;

    // Dynamic Branching Logic
    if (currentStep === Step.CUSTOMER_AND_WORK) {
      if (state.serviceMode === ServiceMode.ONSITE) {
        nextStep = Step.LOCATION;
      } else {
        nextStep = Step.SCHEDULING;
      }
    } else if (currentStep === Step.SCHEDULING) {
      nextStep = Step.FINALIZATION;
    }

    if (nextStep <= Step.FINALIZATION) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    let prevStep = currentStep - 1;

    // Inverse Dynamic Branching Logic
    if (currentStep === Step.SCHEDULING) {
      if (state.serviceMode === ServiceMode.ONSITE) {
        prevStep = Step.LOCATION;
      } else {
        prevStep = Step.CUSTOMER_AND_WORK;
      }
    } else if (currentStep === Step.FINALIZATION) {
      prevStep = Step.SCHEDULING;
    }

    if (prevStep >= Step.CUSTOMER_AND_WORK) {
      setCurrentStep(prevStep);
    }
  };

  const handleBookAgain = (workType: WorkType, serviceMode: ServiceMode, resource: Resource) => {
    const isMultiCustomer = workType === WorkType.WORKSHOP;
    const isMultiResource = workType === WorkType.TRIAL;
    setState({
      ...INITIAL_STATE,
      customers: state.customers,
      workType,
      serviceMode,
      resources: [resource],
      schedulingTab: 'RESOURCES',
      isMultiCustomer,
      isMultiResource,
      location: serviceMode === ServiceMode.ONSITE
        ? (state.customers[0]?.address || '')
        : '',
    });
    setCurrentStep(Step.SCHEDULING);
  };

  const handleFinish = async () => {
    if (onFinish) {
      onFinish(state);
    }
    // Small delay to ensure state reset happens after transition
    setTimeout(() => {
      setCurrentStep(Step.CUSTOMER_AND_WORK);
      setState(INITIAL_STATE);
    }, 300);
  };

  const updateState = (updates: Partial<SchedulingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.CUSTOMER_AND_WORK:
        return <CustomerStep state={state} updateState={updateState} onFastTrack={() => {
          updateState({
            workType: WorkType.INSTALLATION,
            serviceMode: ServiceMode.IN_FIELD,
            fastTrackUsed: true
          });
          setCurrentStep(Step.SCHEDULING);
        }} onBookAgain={handleBookAgain} />;
      case Step.LOCATION:
        return <LocationStep state={state} updateState={updateState} />;
      case Step.SCHEDULING:
        return <SchedulingStep state={state} updateState={updateState} />;
      case Step.FINALIZATION:
        return <ReviewStep state={state} updateState={updateState} />;
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (currentStep === Step.CUSTOMER_AND_WORK) return state.customers.length === 0 || !state.workType || !state.serviceMode;
    if (currentStep === Step.LOCATION) return !state.location;
    // Allow proceeding without explicit resource selection (auto-assignment)
    if (currentStep === Step.SCHEDULING) return !state.date || !state.timeSlot;
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-[1200px] h-[900px] max-w-full max-h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 ease-out">
        
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-gray-50/80 sticky top-0 backdrop-blur-md flex items-center shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div>
                <h2 className="font-bold text-xl leading-tight text-[#001639]">Schedule Appointment</h2>
                <p className="text-xs font-bold text-[#0176d3] uppercase tracking-wider mt-1">
                  {STEP_LABELS[currentStep]}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative">
          <div className="w-full h-full">
            {renderStep()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0 shrink-0">
          <div className="flex gap-4 w-full">
            {currentStep === Step.CUSTOMER_AND_WORK ? (
              <button 
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button 
                onClick={handleBack}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            )}
            
            {currentStep === Step.FINALIZATION ? (
               <button 
                onClick={handleFinish}
                className="flex-[2] px-6 py-3 bg-[#0176d3] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Schedule Appointment
              </button>
            ) : (
              <button 
                onClick={handleNext}
                disabled={isNextDisabled()}
                className={`flex-[2] px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
                  isNextDisabled() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#0176d3] text-white hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                Next Step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
