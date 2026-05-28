function StatusBadge({
  text,
  color = 'bg-gray-600',
  minWidth = 'min-w-[110px]'
}) {
  return (
    <span className={`${color} text-white ${minWidth} text-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap inline-block`}>
      {text || 'Sin estado'}
    </span>
  );
}

export default StatusBadge;
