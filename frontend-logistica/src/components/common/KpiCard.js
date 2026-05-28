function KpiCard({ title, value, color = 'bg-blue-600' }) {
  return (
    <div className={`${color} text-white p-6 rounded-2xl shadow-lg`}>
      <p className="text-lg font-medium">
        {title}
      </p>

      <h2 className="text-4xl font-bold mt-3 break-words">
        {value}
      </h2>
    </div>
  );
}

export default KpiCard;
