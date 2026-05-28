function StatusBadge({
  text,
  color = 'bg-gray-600',
  minWidth = 'min-w-[110px]'
}) {
  return (
    <span className={`${color} text-white ${minWidth} text-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap inline-block`}>
      {text || 'Sin estado'}
    </span>
  );
}

export default StatusBadge;
