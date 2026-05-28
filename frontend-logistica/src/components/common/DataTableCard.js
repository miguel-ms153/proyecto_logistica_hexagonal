import DataTable from 'react-data-table-component';

const defaultStyles = {
  headRow: {
    style: {
      backgroundColor: '#0f172a',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px',
      minHeight: '52px'
    }
  },
  rows: {
    style: {
      minHeight: '60px',
      fontSize: '14px'
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
    <div className="bg-white rounded-xl shadow-sm p-3 overflow-x-auto">
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
