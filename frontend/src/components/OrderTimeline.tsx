import React from 'react';
import { CheckCircle, Circle, Package, Truck, Home, UserCheck } from 'lucide-react';

interface OrderTimelineProps {
    status: string;
}

const steps = [
    { key: 'PENDING', label: 'Requested', icon: Package },
    { key: 'ASSIGNED', label: 'Assigned', icon: UserCheck },
    { key: 'PICKED_UP', label: 'In Transit', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export default function OrderTimeline({ status }: OrderTimelineProps) {
    const currentStepIndex = steps.findIndex(s => s.key === status);
    
    return (
        <div className="w-full py-4">
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-1000 ease-out" 
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                isCompleted 
                                ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100 scale-110' 
                                : 'bg-white border-slate-200 text-slate-300'
                            }`}>
                                <Icon size={14} className={isCompleted ? 'text-white' : ''} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${
                                isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
