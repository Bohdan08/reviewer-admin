import React from "react";
import Pagination from "react-bootstrap/Pagination";

const CustomPagination = ({
  totalCount,
  pageSize,
  active,
  onSetActivePageNumber,
}) => {
  let paginationItems = [];

  const lastPage = Math.ceil(totalCount / pageSize);

  for (let pageNumber = 1; pageNumber <= lastPage; pageNumber++) {
    paginationItems.push(
      <Pagination.Item
        key={pageNumber}
        active={pageNumber === active}
        onClick={() => onSetActivePageNumber(pageNumber)}
      >
        {pageNumber}
      </Pagination.Item>
    );
  }

  return <Pagination>{paginationItems}</Pagination>;
};

export default CustomPagination;
