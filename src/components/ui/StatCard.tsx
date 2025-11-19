import React, { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  small?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  small = false,
}: StatCardProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div>
        <p className={`${small ? "text-xs" : "text-sm"} text-gray-500`}>
          {title}
        </p>
        <p className={`${small ? "text-xl" : "text-3xl"} font-semibold mt-1`}>
          {value}
        </p>
        {trend && (
          <p className="text-xs text-green-600 mt-1">{trend}</p>
        )}
      </div>

      <div className="p-2 rounded-lg bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
