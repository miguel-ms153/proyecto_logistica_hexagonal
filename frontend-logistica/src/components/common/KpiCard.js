function KpiCard({ title, value, color = 'bg-blue-600' }) {
  return (
    <div className={`${color} text-white p-4 md:p-5 rounded-xl shadow-md`}>
      <p className="text-sm md:text-base font-medium">
        {title}
      </p>

      <h2 className="text-2xl md:text-3xl font-bold mt-2 break-words leading-tight">
        {value}
      </h2>
    </div>
  );
}

export default KpiCard;
