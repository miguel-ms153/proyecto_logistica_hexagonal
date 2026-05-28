import KpiCard from './KpiCard';

function KpiGrid({ items, columns = 'md:grid-cols-4' }) {
  return (
    <div className={`grid grid-cols-1 ${columns} gap-6 mb-8`}>
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
