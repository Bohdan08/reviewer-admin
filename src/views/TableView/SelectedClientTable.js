import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  Alert,
  Button,
  ListGroup,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";
import { useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import CustomPagination from "../../components/CustomPagination";
import {
  CLIENTS_API,
  CLINIC_NAME_BY_UNAME,
  PATIENTS_API,
} from "../../constants";
import usePatients from "../../hooks/usePatients";
import getClientsFromLocalStorage from "../../utils/getClientsFromLocalStorage";

const TABLE_HEADERS = [
  "ID",
  "Key",
  "Status",
  "Uploaded",
  "Notifications Sent",
  "Last Notification Time",
  "",
];

const SelectedClientTable = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const location = useLocation();
  const [clientsPageNumber, setClientsPageNumber] = useState(1);
  const [patientsPageNumber, setPatientsPageNumber] = useState(1);
  const [notificationId, setNotificationId] = useState(null);
  const [confirmationModalView, toggleModalConfirmationView] = useState(false);
  const [responseModalView, toggleResponseModalView] = useState(false);
  const [accordionView, toggleAccordionView] = useState(false);

  const currentUname = location.pathname.split("/").pop();

  const clientsData = getClientsFromLocalStorage();

  console.log(clientsPageNumber, "clientsPageNumber");
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

  const notificationResult = useQuery(
    "notificationQuery",
    sendNotificationToServer,
    { enabled: false }
  );

  const onSetClientsPageNumber = (value) => setClientsPageNumber(value);

  const onSetPatientsPageNumber = (value) => setPatientsPageNumber(value);

  const clientsResult = useQuery(
    ["selectedClient", clientsPageNumber],
    () => fetchLogs(clientsPageNumber),
    {
      keepPreviousData: true,
      // enabled: false,
    }
  );

  useEffect(() => {
    clientsResult.refetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openModalConfirmationView = () => toggleModalConfirmationView(true);
  const closeConfirmationModalView = () => {
    toggleModalConfirmationView(false);
    toggleAccordionView(false);
    setPatientsPageNumber(1);
  };

  const openResponseModalView = () => toggleResponseModalView(true);
  const closeResponseModalView = () => toggleResponseModalView(false);

  const initiateNotification = (id, numNotificationsSent) => {
    if (numNotificationsSent === 0) {
      return (
        <Button
          variant="success w-100"
          onClick={() => {
            setNotificationId(id);
            openModalConfirmationView();
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
            openModalConfirmationView();
          }}
        >
          RESEND
        </Button>
      );
    }

    return null;
  };

  // patients
  const patientsResult = usePatients(patientsPageNumber, notificationId, {
    keepPreviousData: true,
    // execute only if notificationId is not null
    enabled: notificationId !== null,
  });

  async function sendNotificationToServer() {
    const tokenAccess = await getAccessTokenSilently();
    const userInfo = await getIdTokenClaims();

    if (tokenAccess && userInfo) {
      const options = {
        method: "POST",
        headers: {
          Authorization: userInfo?.__raw,
        },
      };

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}${PATIENTS_API}/${notificationId}/push`,
        options
      )
        .then((res) => res.json())
        .then((results) => {
          const { status, message, error } = results;

          if (status !== 200) {
            openResponseModalView();
            return {
              header: `${error}: ${status}`,
              message,
            };
          }

          openResponseModalView();
          clientsResult.refetch();
          return {
            status,
            header: "The notification has been sent!",
          };
        })
        .catch(({ message }) => {
          openResponseModalView();
          return { message };
        });
      return response;
    }
    openResponseModalView();
    return;
  }

  return (
    <>
      {notificationResult.isFetching ? (
        <Modal
          centered
          show
          contentClassName="bg-transparent border-0"
          backdropClassName="opacity-75"
        >
          <Spinner
            className="m-auto"
            animation="border"
            role="status"
            variant="light"
          />
          <p className="m-auto mt-3 text-white fs-4">Sending Notification...</p>
        </Modal>
      ) : null}
      <div>
        <h2 className="text-center pb-2">
          {" "}
          {CLINIC_NAME_BY_UNAME[currentUname] || clinicName}{" "}
        </h2>{" "}
        {!confirmationModalView &&
        !responseModalView &&
        clientsResult.isFetching ? (
          <div className="mt-5 center-vertically-block">
            <Spinner
              className="d-flex m-auto"
              animation="border"
              role="status"
            />
            <p className="pt-3">Loading...</p>
          </div>
        ) : clientsResult.data?.data?.length ? (
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
                {clientsResult.data.data.map(
                  ({
                    id,
                    s3key,
                    status,
                    uploadedAt,
                    lastPushTime,
                    numNotificationsSent,
                  }) => (
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
                      <td className="text-capitalize">
                        {lastPushTime || "N/A"}
                      </td>
                      <td className="text-capitalize text-center">
                        {status !== "PENDING" &&
                          initiateNotification(id, numNotificationsSent)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>
            <div>
              {clientsResult.data.pageInfo.totalCount >
                clientsResult.data.pageInfo.pageSize && (
                <CustomPagination
                  pageSize={clientsResult.data.pageInfo.pageSize}
                  totalCount={clientsResult.data.pageInfo.totalCount}
                  active={clientsPageNumber}
                  onSetActivePageNumber={onSetClientsPageNumber}
                />
              )}
            </div>
          </>
        ) : (
          <Alert
            variant="danger"
            className="mt-5 m-auto w-50 text-center text-break"
          >
            {clientsResult.data?.header || clientsResult.data?.message ? (
              <>
                <b> {clientsResult.data.header}</b>

                {clientsResult.data?.message && (
                  <p className="mt-2">{clientsResult.data.message} </p>
                )}
              </>
            ) : (
              "No Logs Found..."
            )}
          </Alert>
        )}
      </div>
      {confirmationModalView ? (
        <Modal
          show={confirmationModalView}
          onHide={closeConfirmationModalView}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-center">Are you sure?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Accordion
              onClick={() => {
                toggleAccordionView(!accordionView);

                if (!accordionView) {
                  patientsResult.refetch();
                }
              }}
            >
              <Accordion.Item eventKey="0">
                <Accordion.Header className="d-inline">
                  Check affected patients with ID
                  <span className="d-inline px-1 fw-bold">
                    {" "}
                    {notificationId}
                  </span>
                </Accordion.Header>
                <Accordion.Body className="p-0">
                  {clientsResult.isFetching ||
                  patientsResult.isFetching ||
                  patientsResult.isLoading ? (
                    <div className="mt-2">
                      <Spinner
                        className="d-flex m-auto"
                        animation="border"
                        role="status"
                      />
                      <p className="pt-3 text-center">Loading...</p>
                    </div>
                  ) : patientsResult.data?.data?.length ? (
                    <>
                      <ListGroup className="rounded-0">
                        {patientsResult.data.data.map(
                          ({ fname, lname, sendable }) => (
                            <ListGroup.Item
                              key={`${fname} ${lname}`}
                              variant={sendable ? "success" : "secondary"}
                            >
                              {`${fname} ${lname}`}
                            </ListGroup.Item>
                          )
                        )}
                      </ListGroup>
                      <div className="mt-0 ">
                        {patientsResult.data.pageInfo.totalCount >
                          patientsResult.data.pageInfo.pageSize && (
                          <CustomPagination
                            styles="m-0 p-0 rounded-0 modal-pagination"
                            pageSize={patientsResult.data.pageInfo.pageSize}
                            totalCount={patientsResult.data.pageInfo.totalCount}
                            active={patientsPageNumber}
                            onSetActivePageNumber={onSetPatientsPageNumber}
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <Alert
                      variant="danger"
                      className="my-4 mx-auto w-75 text-center text-break"
                    >
                      {patientsResult.data?.header ||
                      patientsResult.data?.message ? (
                        <>
                          <b> {patientsResult.data.header}</b>

                          {patientsResult.data.message && (
                            <p className="mt-2">
                              {patientsResult.data.message}{" "}
                            </p>
                          )}
                        </>
                      ) : (
                        "No Patients Found..."
                      )}
                    </Alert>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                closeConfirmationModalView();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                notificationResult.refetch();
                closeConfirmationModalView();
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
          <Modal.Header closeButton>
            <Modal.Title>
              {notificationResult.data?.header ||
                "Couldn't get user's credentials"}
            </Modal.Title>
          </Modal.Header>

          {notificationResult.data?.message && (
            <Modal.Body>{notificationResult.data.message}</Modal.Body>
          )}
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                /* setNotificationResponse({
                  status: undefined,
                  header: "",
                  message: "",
                }); */
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
