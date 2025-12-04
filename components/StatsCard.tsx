interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, color = 'blue', subtitle }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const bgColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className="card p-6 hover:scale-105 transition-transform duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
