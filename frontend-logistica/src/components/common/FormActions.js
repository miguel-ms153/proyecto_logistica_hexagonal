function FormActions({
  loading,
  editing,
  createLabel,
  updateLabel,
  loadingLabel = 'Guardando...',
  onSubmit,
  onCancel,
  submitColor = 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
}) {
  return (
    <div className="flex flex-wrap gap-3 mt-5">
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={`${submitColor} text-white px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm`}
      >
        {loading ? loadingLabel : editing ? updateLabel : createLabel}
      </button>

      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm"
        >
          Cancelar
        </button>
      )}
    </div>
  );
}

export default FormActions;
