import DataTable from 'react-data-table-component';

const defaultStyles = {
  headRow: {
    style: {
      backgroundColor: '#0f172a',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '15px',
      minHeight: '62px'
    }
  },
  rows: {
    style: {
      minHeight: '78px',
      fontSize: '15px'
    }
  }
};

function DataTableCard({
  columns,
  data,
  noData = 'No hay registros disponibles',
  customStyles = defaultStyles,
  fixedHeader = true,
  fixedHeaderScrollHeight = '500px'
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
      <DataTable
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        striped
        responsive
        selectableRows
        fixedHeader={fixedHeader}
        fixedHeaderScrollHeight={fixedHeaderScrollHeight}
        customStyles={customStyles}
        noDataComponent={noData}
      />
    </div>
  );
}

export default DataTableCard;
