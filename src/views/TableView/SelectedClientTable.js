import { useAuth0 } from "@auth0/auth0-react";
import React, { useState } from "react";
import { Alert, Spinner, Table } from "react-bootstrap";
import { useQuery } from "react-query";
import { useSearchParams, useLocation } from "react-router-dom";
import { CLIENTS_API, CLINIC_NAME_BY_UNAME } from "../../constants";
import getClientsFromLocalStorage from "../../utils/getClientsFromLocalStorage";

const TABLE_HEADERS = ["ID", "Key", "Status", "Uploaded"];

const SelectedClientTable = () => {
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const currentID = searchParams.get("clientId");

  const currentUname = location.pathname.split("/").pop();

  const clientsData = getClientsFromLocalStorage();

  const clinicName = clientsData.length
    ? clientsData.filter(({ uname }) => currentUname === uname)[0]?.name
    : "No Clinic Selected";

  const fetchLogs = async () => {
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
        `${process.env.REACT_APP_BASE_URL}${CLIENTS_API}/${currentID}/logs`,
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

  const result = useQuery("selectedClient", fetchLogs);

  return (
    <div>
      <h2 className="text-center pb-2">
        {" "}
        {CLINIC_NAME_BY_UNAME[currentUname] || clinicName}{" "}
      </h2>{" "}
      {loading ? (
        <div className="mt-5 center-vertically-block">
          <Spinner className="d-flex m-auto" animation="border" role="status" />
          <p className="pt-3">Loading...</p>
        </div>
      ) : result.data?.data?.length ? (
        <>
          <Table bordered className="rounded">
            <thead>
              <tr>
                {TABLE_HEADERS.map((headerName) => (
                  <th key={headerName}> {headerName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.data.data.map(({ id, s3key, status, uploadedAt }) => (
                <tr key={id}>
                  <td className="text-capitalize">{id}</td>
                  <td className="text-capitalize">{s3key}</td>
                  <td className="text-capitalize">{status}</td>
                  <td className="text-capitalize">{uploadedAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <Alert
          variant="danger"
          className="mt-5 m-auto w-50 text-center text-break"
        >
          {result.data ? (
            <>
              <b> {result.data.header}</b>

              <p className="mt-2">{result.data.message} </p>
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
