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
    <div className="flex flex-wrap gap-3 mt-6">
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={`${submitColor} text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap`}
      >
        {loading ? loadingLabel : editing ? updateLabel : createLabel}
      </button>

      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap"
        >
          Cancelar
        </button>
      )}
    </div>
  );
}

export default FormActions;
