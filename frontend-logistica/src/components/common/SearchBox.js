function SearchBox({
  value,
  onChange,
  placeholder = 'Buscar...',
  focusColor = 'focus:ring-blue-500'
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow mb-6">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full
          border
          border-gray-300
          rounded-xl
          p-4
          outline-none
          bg-white
          focus:ring-2
          ${focusColor}
        `}
      />
    </div>
  );
}

export default SearchBox;
