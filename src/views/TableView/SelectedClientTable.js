import { useAuth0 } from "@auth0/auth0-react";
import React, { useState } from "react";
import { Alert, Button, Modal, Spinner, Table } from "react-bootstrap";
import { useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import CustomPagination from "../../components/CustomPagination";
import {
  CLIENTS_API,
  CLINIC_NAME_BY_UNAME,
  PATIENTS_API,
} from "../../constants";
import getClientsFromLocalStorage from "../../utils/getClientsFromLocalStorage";

const TABLE_HEADERS = [
  "ID",
  "Key",
  "Status",
  "Uploaded",
  "Notifications Sent",
  "",
];

const SelectedClientTable = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const location = useLocation();
  const [activePageNumber, setActivePageNumber] = useState(1);
  const [notificationId, setNotificationId] = useState(null);
  const [modalView, toggleModalView] = useState(false);
  const [responseModalView, toggleResponseModalView] = useState(false);
  const [notificationResponse, setNotificationResponse] = useState({
    header: "",
    message: "",
  });

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

  async function sendNotificationToServer() {
    const tokenAccess = await getAccessTokenSilently();
    const userInfo = await getIdTokenClaims();

    if (tokenAccess && userInfo) {
      const options = {
        method: "POST",
        headers: {
          Authorization: userInfo?.__raw,
          // Authorization: "",
        },
      };

      fetch(
        `${process.env.REACT_APP_BASE_URL}${PATIENTS_API}/${notificationId}/push`,
        options
      )
        .then((res) => res.json())
        .then((results) => {
          const { status, message, error } = results;

          if (status !== 200) {
            openResponseModalView();
            setNotificationResponse({
              header: `${error}: ${status}`,
              message,
            });
            return;
          }

          openResponseModalView();
          setNotificationResponse({
            status,
            header: "The notification has been sent!",
          });
          return;
        })
        .catch(({ message }) => {
          openResponseModalView();
          setNotificationResponse({
            message,
          });
          return;
        });
    } else {
      setNotificationResponse({
        header: "Couldn't get user's credentials",
      });
      return;
    }
  }

  const onSetActivePageNumber = (value) => {
    setActivePageNumber(value);
  };

  const {
    isFetching,
    data: { data, pageInfo, message, header } = {},
  } = useQuery(
    ["selectedClient", activePageNumber, notificationResponse.status],
    () => fetchLogs(activePageNumber),
    {
      keepPreviousData: true,
      // The query will not execute until notificationResponse is not equal 200
      enabled: notificationResponse.status !== 200,
    }
  );

  console.log(isFetching, "isFetching");

  const openModalView = () => toggleModalView(true);
  const closeModalView = () => toggleModalView(false);

  const openResponseModalView = () => toggleResponseModalView(true);
  const closeResponseModalView = () => toggleResponseModalView(false);

  const initiateNotification = (id, numNotificationsSent) => {
    if (numNotificationsSent === 0) {
      return (
        <Button
          variant="success w-100"
          onClick={() => {
            setNotificationId(id);
            openModalView();
          }}
        >
          SEND
        </Button>
      );
    }

    if (numNotificationsSent > 0 && numNotificationsSent < 3) {
      return (
        <Button
          variant="danger w-100"
          onClick={() => {
            setNotificationId(id);
            openModalView();
          }}
        >
          RESEND
        </Button>
      );
    }

    return null;
  };

  return (
    <>
      <div>
        <h2 className="text-center pb-2">
          {" "}
          {CLINIC_NAME_BY_UNAME[currentUname] || clinicName}{" "}
        </h2>{" "}
        {isFetching ? (
          <div className="mt-5 center-vertically-block">
            <Spinner
              className="d-flex m-auto"
              animation="border"
              role="status"
            />
            <p className="pt-3">Loading...</p>
          </div>
        ) : data?.length ? (
          <>
            <Table bordered hover responsive>
              <thead>
                <tr>
                  {TABLE_HEADERS.map((headerName) => (
                    <th key={headerName}> {headerName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(
                  ({ id, s3key, status, uploadedAt, numNotificationsSent }) => (
                    <tr
                      key={id}
                      className={status === "PENDING" ? " " : "cursor-pointer"}
                      onClick={(event) => {
                        if (status !== "PENDING" && event.target.value !== "") {
                          navigate(`${id}`);
                        }
                      }}
                    >
                      <td className="text-capitalize">{id}</td>
                      <td className="text-capitalize">{s3key}</td>
                      <td className="text-capitalize">{status}</td>
                      <td className="text-capitalize">
                        {uploadedAt ? uploadedAt.slice(0, 10) : "N/A"}
                      </td>
                      <td className="text-capitalize">
                        {numNotificationsSent}
                      </td>
                      <td className="text-capitalize text-center">
                        {initiateNotification(id, numNotificationsSent)}
                      </td>
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
              "No Logs Found..."
            )}
          </Alert>
        )}
      </div>
      {modalView ? (
        <Modal show={modalView} onHide={closeModalView} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-center">Are you sure?</Modal.Title>
          </Modal.Header>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeModalView}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                sendNotificationToServer();
                closeModalView();
              }}
            >
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      ) : null}
      {responseModalView ? (
        <Modal
          show={responseModalView}
          onHide={closeResponseModalView}
          centered
        >
          {notificationResponse.header && (
            <Modal.Header closeButton>
              <Modal.Title>{notificationResponse.header}</Modal.Title>
            </Modal.Header>
          )}
          {notificationResponse.message && (
            <Modal.Body>{notificationResponse.message}</Modal.Body>
          )}
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setNotificationResponse({
                  status: undefined,
                  header: "",
                  message: "",
                });
                closeResponseModalView();
              }}
            >
              Okay
            </Button>
          </Modal.Footer>
        </Modal>
      ) : null}
    </>
  );
};

export default SelectedClientTable;
