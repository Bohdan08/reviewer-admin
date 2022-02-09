import { useAuth0 } from "@auth0/auth0-react";
import React, { useState } from "react";
import { Alert, Spinner, Table } from "react-bootstrap";
import { useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import CustomPagination from "../../components/CustomPagination";
import { CLIENTS_API, CLINIC_NAME_BY_UNAME } from "../../constants";
import getClientsFromLocalStorage from "../../utils/getClientsFromLocalStorage";

const TABLE_HEADERS = ["ID", "Key", "Status", "Uploaded"];

const SelectedClientTable = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const location = useLocation();
  const [activePageNumber, setActivePageNumber] = useState(1);

  const currentUname = location.pathname.split("/").pop();

  const clientsData = getClientsFromLocalStorage();

  const currentClientId =
    clientsData?.length &&
    clientsData.filter(({ uname }) => currentUname === uname)[0]?.id;

  const clinicName = clientsData?.length
    ? clientsData.filter(({ uname }) => currentUname === uname)[0]?.name
    : "No Clinic Selected";

  const fetchLogs = async (selectedPage = 1) => {
    if (currentClientId) {
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
          `${process.env.REACT_APP_BASE_URL}${CLIENTS_API}/${currentClientId}/logs?page=${selectedPage}`,
          options
        )
          .then((res) => res.json())
          .then(({ status, data, error, message, pageInfo }) => {
            if (status !== 200) {
              return {
                data: [],
                header: `${error}: ${status}`,
                message,
                status,
              };
            }

            return { data, pageInfo };
          })
          .catch(({ message }) => {
            return {
              data: [],
              message,
            };
          });

        return response;
      }
      return;
    }
    return;
  };

  const onSetActivePageNumber = (value) => {
    setActivePageNumber(value);
  };

  const {
    isFetching,
    data: { data, pageInfo, message, header } = {},
  } = useQuery(
    ["selectedClient", activePageNumber],
    () => fetchLogs(activePageNumber),
    { keepPreviousData: true }
  );

  return (
    <div>
      <h2 className="text-center pb-2">
        {" "}
        {CLINIC_NAME_BY_UNAME[currentUname] || clinicName}{" "}
      </h2>{" "}
      {isFetching ? (
        <div className="mt-5 center-vertically-block">
          <Spinner className="d-flex m-auto" animation="border" role="status" />
          <p className="pt-3">Loading...</p>
        </div>
      ) : data?.length ? (
        <>
          <Table bordered hover className="rounded">
            <thead>
              <tr>
                {TABLE_HEADERS.map((headerName) => (
                  <th key={headerName}> {headerName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(({ id, s3key, status, uploadedAt }) => (
                <tr
                  key={id}
                  className={status === "PENDING" ? " " : "cursor-pointer"}
                  onClick={() => {
                    if (status !== "PENDING") {
                      navigate(`${id}`);
                    }
                  }}
                >
                  <td className="text-capitalize">{id}</td>
                  <td className="text-capitalize">{s3key}</td>
                  <td className="text-capitalize">{status}</td>
                  <td className="text-capitalize">{uploadedAt.slice(0, 10)}</td>
                </tr>
              ))}
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
            "No Logs Found..."
          )}
        </Alert>
      )}
    </div>
  );
};

export default SelectedClientTable;
