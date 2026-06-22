import { StatusInfo } from '@shared/constants/statusMaps';

interface BadgeProps {
  status: string;
  statusMap?: Record<string, StatusInfo>;
  className?: string;
}

export default function Badge({ status, statusMap, className = '' }: BadgeProps) {
  const info = statusMap?.[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${info.cls} ${className}`}>
      {info.label}
    </span>
  );
}
