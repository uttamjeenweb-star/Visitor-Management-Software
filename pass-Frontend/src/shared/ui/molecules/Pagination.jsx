import { Button } from "@/shared/ui/atoms/Button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { usePagination, DOTS } from "@/shared/hooks/usePagination";
export const Pagination = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
}) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });
  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }
  const onNext = () => {
    onPageChange(currentPage + 1);
  };
  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };
  const lastPage = paginationRange[paginationRange.length - 1];
  return (
    <ul className="pagination-list">
      {
        <li>
          {
            <Button
              variant="outline"
              size="icon"
              onClick={onPrevious}
              disabled={currentPage === 1}
            >
              {<ChevronLeft className="h-4 w-4" />}
            </Button>
          }
        </li>
      }
      {paginationRange.map((pageNumber, idx) => {
        if (pageNumber === DOTS) {
          return (
            <li key={`dots-${idx}`} className="pagination-dots">
              {<MoreHorizontal className="h-4 w-4" />}
            </li>
          );
        }
        return (
          <li key={pageNumber}>
            {
              <Button
                variant={pageNumber === currentPage ? "primary" : "ghost"}
                size="icon"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            }
          </li>
        );
      })}
      {
        <li>
          {
            <Button
              variant="outline"
              size="icon"
              onClick={onNext}
              disabled={currentPage === lastPage}
            >
              {<ChevronRight className="h-4 w-4" />}
            </Button>
          }
        </li>
      }
    </ul>
  );
};
