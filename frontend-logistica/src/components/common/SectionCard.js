function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`bg-white p-4 md:p-5 rounded-xl shadow-sm mb-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}

export default SectionCard;
