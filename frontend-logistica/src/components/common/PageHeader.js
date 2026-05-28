function PageHeader({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-blue-600'
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm md:text-base text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <div className={`${badgeColor} text-white px-4 py-2 rounded-xl font-semibold shadow whitespace-nowrap text-sm`}>
          {badge}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
