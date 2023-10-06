import { useState } from "react";
import { Cite } from "./Cite";
import { Pagination } from "react-bootstrap";

export const CitesList = ({ cites, totalPages = 10 }) => {
  const [page, setPage] = useState(1);
  const pagesToShow = totalPages > 10 ? 10 : totalPages;
  let startPage = Math.max(page - Math.floor(pagesToShow / 2), 1);
  let endPage = Math.min(page + Math.floor(pagesToShow / 2), totalPages - 1);

  const paginate = () => {
    return (
      <Pagination className="justify-content-center" size="sm">
        <Pagination.First onClick={() => setPage(1)} />
        <Pagination.Prev onClick={() => page > 1 && setPage(page - 1)} />
        <Pagination.Ellipsis />
        {Array(endPage - startPage + 1)
          .fill("")
          .map((_, i) => (
            <Pagination.Item
              key={i}
              active={i + startPage === page}
              href="#"
              onClick={() => setPage(i + startPage)}
            >
              {i + startPage}
            </Pagination.Item>
          ))}
        <Pagination.Ellipsis />
        <Pagination.Next
          onClick={() => page < totalPages - 1 && setPage(page + 1)}
        />
        <Pagination.Last onClick={() => setPage(totalPages - 1)} />
      </Pagination>
    );
  };

  return (
    <div>
      {paginate()}
      <ul className="list-group mt-2 mb-3">
        {cites.slice((page - 1) * 10, page * 10).map((cite, index) => (
          <Cite key={index} cite={cite} />
        ))}
      </ul>
    </div>
  );
};
