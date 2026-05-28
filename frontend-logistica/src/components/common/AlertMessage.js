function AlertMessage({ message, type = 'error' }) {
  if (!message) return null;

  const color =
    type === 'success'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';

  return (
    <div className={`${color} px-4 py-3 rounded-xl font-semibold mb-5`}>
      {message}
    </div>
  );
}

export default AlertMessage;
