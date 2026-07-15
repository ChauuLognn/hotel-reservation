import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  borderColor?: string; // Optional custom border
  iconBg?: string; // Optional custom icon background
  className?: string;
}

export default function StatCard({ label, value, icon, iconBg = 'bg-apple-canvas-parchment', className = '' }: StatCardProps) {
  return (
    <div className={`bg-apple-canvas rounded-apple-lg p-5 hairline-border apple-card-hover flex items-center justify-between animate-fade-in ${className}`}>
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-apple-ink-muted-48 uppercase tracking-wider font-semibold">{label}</p>
        <h3 className="text-2xl font-bold text-apple-ink font-display">{value}</h3>
      </div>
      <div className={`w-11 h-11 rounded-apple-sm flex items-center justify-center text-apple-ink ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}
