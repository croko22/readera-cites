import React from "react";
import { Cite } from "./Cite";
import { Pagination } from "react-bootstrap";

//TODO: Decidir entre paginacion o scroll infinito o grid
//TODO: Add an option to view as a grid and then expand to a modal

export const CitesList = ({ cites, totalPages = 10 }) => {
  const [page, setPage] = React.useState(0);

  const paginate = () => {
    return (
      <Pagination>
        <Pagination.First onClick={() => setPage(1)} />
        <Pagination.Prev onClick={() => setPage(page - 1)} />
        {Array(totalPages - 1)
          .fill("")
          .map((_, i) => (
            <Pagination.Item
              key={i}
              active={i + 1 === page}
              href="#"
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        <Pagination.Next onClick={() => setPage(page + 1)} />
        <Pagination.Last onClick={() => setPage(totalPages - 1)} />
      </Pagination>
    );
  };

  return (
    <div>
      {paginate()}
      <ul className="list-group mt-2 mb-3">
        {/* //? Search works */}
        {/* {cites.map((cite, index) => (
          <Cite key={index} cite={cite} />
        ))} */}

        {cites.slice((page - 1) * 10, page * 10).map((cite, index) => (
          <Cite key={index} cite={cite} />
        ))}
      </ul>
    </div>
  );
};
