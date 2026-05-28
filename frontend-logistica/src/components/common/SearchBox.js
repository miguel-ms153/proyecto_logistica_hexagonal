function SearchBox({
  value,
  onChange,
  placeholder = 'Buscar...',
  focusColor = 'focus:ring-blue-500'
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-5">
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
          px-4
          py-3
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
