function PageHeader({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-blue-600'
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5 mb-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-800">
          {title}
        </h1>

        {subtitle && (
          <p className="text-gray-500 mt-2">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <div className={`${badgeColor} text-white px-5 py-3 rounded-2xl font-semibold shadow-lg whitespace-nowrap`}>
          {badge}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
