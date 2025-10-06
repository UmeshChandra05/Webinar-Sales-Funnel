import React, { useState, useMemo } from 'react';
import { useTable, useSortBy, usePagination, useGlobalFilter } from 'react-table';

// Global filter component
function GlobalFilter({ globalFilter, setGlobalFilter }) {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-xs font-medium text-gray-700">Search:</label>
      <input
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value || undefined)}
        placeholder="Search..."
        className="px-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent bg-white"
      />
    </div>
  );
}

const DataTable = ({ data, title = "Data Table" }) => {
  const [selectedRows, setSelectedRows] = useState(new Set());

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const sampleRow = data[0];
    const excludedFields = ['Registration_TS', 'Transaction_TS']; // Raw timestamps
    
    return Object.keys(sampleRow)
      .filter(key => !excludedFields.includes(key))
      .map(key => ({
        Header: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
        accessor: key,
        Cell: ({ value, row, column }) => {
          // Format specific fields
          if (column.id === 'Registration_TS' || column.id === 'Transaction_TS') {
            try {
              return (
                <span className="text-gray-600 font-mono text-xs">
                  {new Date(value).toLocaleString()}
                </span>
              );
            } catch {
              return value;
            }
          }
          
          if (column.id === 'Paid Amount' || column.id === 'Cost' || column.id === 'PayableAmount') {
            return value ? (
              <span className="font-bold text-green-600">
                ₹{parseFloat(value).toLocaleString()}
              </span>
            ) : '-';
          }
          
          if (column.id === 'Payment Status') {
            const statusColors = {
              success: 'bg-green-100 text-green-800',
              failed: 'bg-red-100 text-red-800',
              need_time_to_confirm: 'bg-yellow-100 text-yellow-800',
              pending: 'bg-yellow-100 text-yellow-800'
            };
            
            return (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
                {value}
              </span>
            );
          }
          
          if (column.id === 'Email') {
            return (
              <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 underline">
                {value}
              </a>
            );
          }
          
          if (column.id === 'Phone') {
            return (
              <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-800">
                {value}
              </a>
            );
          }
          
          return value || '-';
        },
        sortType: (a, b, columnId) => {
          if (columnId === 'Paid Amount' || columnId === 'Cost' || columnId === 'PayableAmount') {
            const aVal = parseFloat(a.values[columnId]) || 0;
            const bVal = parseFloat(b.values[columnId]) || 0;
            return aVal - bVal;
          }
          return a.values[columnId]?.toString().localeCompare(b.values[columnId]?.toString() || '') || 0;
        }
      }));
  }, [data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    state,
    setGlobalFilter,
    prepareRow,
  } = useTable(
    {
      columns,
      data: data || [],
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <GlobalFilter
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>

      {/* Table controls */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-700">Show:</label>
          <select
            value={state.pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
          >
            {[5, 10, 20, 30, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-700">entries</span>
        </div>
        
        <div className="text-xs text-gray-700">
          Showing {state.pageIndex * state.pageSize + 1} to {Math.min((state.pageIndex + 1) * state.pageSize, data.length)} of {data.length} entries
        </div>
      </div>

      {/* Table - with proper white background */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            {headerGroups.map((headerGroup, idx) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
                {headerGroup.headers.map((column, colIdx) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={colIdx}
                    className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.render('Header')}</span>
                      <span className="text-gray-400 text-xs">
                        {column.isSorted
                          ? column.isSortedDesc
                            ? '↓'
                            : '↑'
                          : '↕'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {page.map((row, rowIdx) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={rowIdx} className="hover:bg-gray-50 bg-white">
                  {row.cells.map((cell, cellIdx) => (
                    <td
                      {...cell.getCellProps()}
                      key={cellIdx}
                      className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 bg-white"
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="px-2 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
          >
            {'<<'}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
          >
            Previous
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
          >
            Next
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className="px-2 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
          >
            {'>>'}
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-700">
            Page {state.pageIndex + 1} of {pageOptions.length}
          </span>
          <select
            value={state.pageIndex}
            onChange={e => gotoPage(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
          >
            {pageOptions.map((page, idx) => (
              <option key={idx} value={idx}>
                {idx + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DataTable;