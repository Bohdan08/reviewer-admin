import React, { useState } from "react";
import { Alert, Spinner, Table } from "react-bootstrap";
import { useLocation } from "react-router";
import CustomPagination from "../../components/CustomPagination";
import usePatients from "../../hooks/usePatients";

const TABLE_HEADERS = [
  "ID",
  "Full Name",
  "Phone",
  "Status",
  "Last Visit",
  "Reviews",
];

const SelectedPatiensTable = () => {
  const location = useLocation();
  const [activePageNumber, setActivePageNumber] = useState(1);

  const selectedPatientsId = location.pathname.split("/").pop();

  const {
    isFetching,
    isLoading,
    data: { data, pageInfo, message, header } = {},
  } = usePatients(activePageNumber, selectedPatientsId);

  const onSetActivePageNumber = (value) => setActivePageNumber(value);

  return (
    <div>
      {" "}
      <h2 className="text-center pb-2">Patients</h2>{" "}
      {isLoading || isFetching ? (
        <div className="mt-5 center-vertically-block">
          <Spinner className="d-flex m-auto" animation="border" role="status" />
          <p className="pt-3">Loading...</p>
        </div>
      ) : data?.length ? (
        <>
          <Table bordered>
            <thead>
              <tr>
                {TABLE_HEADERS.map((headerName) => (
                  <th key={headerName}> {headerName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(
                ({
                  id,
                  fname,
                  lname,
                  phone,
                  status,
                  lastVisitedOn,
                  reviews,
                }) => (
                  <tr key={id}>
                    <td className="text-capitalize">{id}</td>
                    <td className="text-capitalize">
                      {fname} {lname}
                    </td>
                    <td className="text-capitalize">{phone}</td>
                    <td className="text-capitalize">{status}</td>
                    <td className="text-capitalize">
                      {lastVisitedOn ? lastVisitedOn.slice(0, 10) : "N/A"}
                    </td>
                    <td className="text-capitalize">{reviews || "N/A"}</td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
          <div>
            {pageInfo.totalCount > pageInfo.pageSize && (
              <CustomPagination
                pageSize={pageInfo.pageSize}
                totalCount={pageInfo.totalCount}
                active={activePageNumber}
                onSetActivePageNumber={onSetActivePageNumber}
              />
            )}
          </div>
        </>
      ) : (
        <Alert
          variant="danger"
          className="mt-5 m-auto w-50 text-center text-break"
        >
          {header || message ? (
            <>
              <b> {header}</b>

              {message && <p className="mt-2">{message} </p>}
            </>
          ) : (
            "No Patients Found"
          )}
        </Alert>
      )}
    </div>
  );
};

export default SelectedPatiensTable;
