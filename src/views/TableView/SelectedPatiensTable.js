import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router";
import { PATIENTS_API } from "../../constants";
import { useQuery } from "react-query";
import { Alert, Spinner, Table } from "react-bootstrap";
import CustomPagination from "../../components/CustomPagination";

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
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [activePageNumber, setActivePageNumber] = useState(1);

  const selectedPatientsId = location.pathname.split("/").pop();

  const fetchPatients = async (selectedPage = 1) => {
    setLoading(true);
    const tokenAccess = await getAccessTokenSilently();
    const userInfo = await getIdTokenClaims();

    if (tokenAccess && userInfo) {
      const options = {
        method: "GET",
        headers: {
          Authorization: userInfo?.__raw,
        },
      };

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}${PATIENTS_API}/${selectedPatientsId}/patients?page=${selectedPage}`,
        options
      )
        .then((res) => res.json())
        .then(({ status, data, error, message, pageInfo }) => {
          if (status !== 200) {
            setLoading(false);
            return {
              data: [],
              header: `${error}: ${status}`,
              message,
              status,
            };
          }

          setLoading(false);
          return { data, pageInfo };
        })
        .catch(({ message }) => {
          return {
            data: [],
            message,
          };
        });

      setLoading(false);
      return response;
    }
    return;
  };

  const result = useQuery(
    ["selectedPatients", activePageNumber],
    () => fetchPatients(activePageNumber),
    { keepPreviousData: true }
  );

  const onSetActivePageNumber = (value) => {
    setActivePageNumber(value);
  };

  return (
    <div>
      {" "}
      <h2 className="text-center pb-2">Patients</h2>{" "}
      {loading ? (
        <div className="mt-5 center-vertically-block">
          <Spinner className="d-flex m-auto" animation="border" role="status" />
          <p className="pt-3">Loading...</p>
        </div>
      ) : result.data?.data?.length ? (
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
              {result.data.data.map(
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
            {result.data.pageInfo.totalCount >
              result.data.pageInfo.pageSize && (
              <CustomPagination
                pageSize={result.data.pageInfo.pageSize}
                totalCount={result.data.pageInfo.totalCount}
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
          {result.data && (result.data.header || result.data.message) ? (
            <>
              <b> {result.data.header}</b>

              <p className="mt-2">{result.data.message} </p>
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
