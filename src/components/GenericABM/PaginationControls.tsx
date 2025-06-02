import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  hasNext: boolean;
  dataLength: number;
  getTotalPages: () => number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalItems,
  hasNext,
  dataLength,
  getTotalPages,
  onPageChange,
  onNextPage,
  onPrevPage
}) => {
  const totalPages = getTotalPages();

  if (currentPage === 1 && !hasNext) {
    return null;
  }

  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <div>
        <span className="text-muted">
          Página {currentPage} de {totalPages} - Mostrando {dataLength} de {totalItems} elementos
        </span>
      </div>
      <nav aria-label="Page navigation">
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={onPrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
          </li>
          
          {totalPages > 1 && (
            <>
              {currentPage > 2 && (
                <>
                  <li className="page-item">
                    <button className="page-link" onClick={() => onPageChange(1)}>1</button>
                  </li>
                  {currentPage > 3 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                </>
              )}
              
              {currentPage > 1 && (
                <li className="page-item">
                  <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
                    {currentPage - 1}
                  </button>
                </li>
              )}
              
              <li className="page-item active">
                <span className="page-link">{currentPage}</span>
              </li>
              
              {hasNext && (
                <li className="page-item">
                  <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
                    {currentPage + 1}
                  </button>
                </li>
              )}
              
              {hasNext && currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                  <li className="page-item">
                    <button className="page-link" onClick={() => onPageChange(totalPages)}>
                      {totalPages}
                    </button>
                  </li>
                </>
              )}
            </>
          )}
          
          {hasNext && (
            <li className="page-item">
              <button 
                className="page-link" 
                onClick={onNextPage}
              >
                Siguiente
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default PaginationControls; 