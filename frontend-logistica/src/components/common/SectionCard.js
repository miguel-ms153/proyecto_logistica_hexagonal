function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`bg-white p-6 rounded-2xl shadow mb-8 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-slate-800">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="text-gray-500 mt-1">
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
