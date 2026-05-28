import KpiCard from './KpiCard';

function KpiGrid({ items, columns = 'md:grid-cols-4' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns} gap-4 mb-6`}>
      {items.map((item) => (
        <KpiCard
          key={item.title}
          title={item.title}
          value={item.value}
          color={item.color}
        />
      ))}
    </div>
  );
}

export default KpiGrid;
