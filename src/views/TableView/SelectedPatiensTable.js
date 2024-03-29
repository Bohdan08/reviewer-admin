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
  "Rating",
  "Message",
  "Attempts",
];

const SelectedPatiensTable = () => {
  const location = useLocation();
  const [activePageNumber, setActivePageNumber] = useState(1);

  const lastUrlPiece = location.pathname.split("/").pop();

  const selectedPatientsId = lastUrlPiece.split("-")[1];
  const selectedPatientsType = lastUrlPiece.split("-")[0];

  const adjustedTableHeaders = TABLE_HEADERS.filter(
    (headerName) =>
      (selectedPatientsType === "direct" &&
        headerName !== "Rating" &&
        headerName !== "Message") ||
      selectedPatientsType !== "direct"
  );

  const {
    isFetching,
    isLoading,
    data: { data, pageInfo, message, header } = {},
  } = usePatients(activePageNumber, selectedPatientsId);

  const onSetActivePageNumber = (value) => setActivePageNumber(value);

  return (
    <div>
      {" "}
      <h2 className="text-center pb-2">
        Patients ({`${selectedPatientsType}`})
      </h2>{" "}
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
                {adjustedTableHeaders.map((headerName) => (
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
                  visits = [],
                  attempts,
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
                    {selectedPatientsType !== "direct" ? (
                      <td className="text-capitalize">
                        {visits[0] && visits[0].review
                          ? visits[0].review.rating
                          : "N/A"}
                      </td>
                    ) : null}
                    {selectedPatientsType !== "direct" ? (
                      <td className="text-capitalize">
                        {visits[0] &&
                        visits[0].review &&
                        visits[0].review.message
                          ? visits[0].review.message
                          : "N/A"}
                      </td>
                    ) : null}
                    <td className="text-capitalize">{attempts || "N/A"}</td>
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
