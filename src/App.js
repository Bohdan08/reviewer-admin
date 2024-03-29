import { useState, useEffect } from "react";
import { useAuth0, withAuth0 } from "@auth0/auth0-react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import {
  Container,
  Nav,
  Navbar,
  Image,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { CLIENTS_API, NAV_ITEMS } from "./constants";
import Page from "./navigation/Page";

// assets
import logo from "./assets/logo.png";

const App = ({ routes }) => {
  const {
    loginWithRedirect,
    isLoading,
    user,
    isAuthenticated,
    logout,
    getAccessTokenSilently,
    getIdTokenClaims,
  } = useAuth0();

  const [activeNav, setActiveNav] = useState(NAV_ITEMS[0].key);
  const [clientsInfo, setClientsInfo] = useState();
  const [clientsError, setClientsError] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  async function getClientsData() {
    setLoadingClients(true);
    const tokenAccess = await getAccessTokenSilently();
    const userInfo = await getIdTokenClaims();

    if (tokenAccess && userInfo) {
      const options = {
        method: "GET",
        headers: {
          Authorization: userInfo?.__raw,
          // Authorization: "",
        },
      };

      fetch(`${process.env.REACT_APP_BASE_URL}${CLIENTS_API}`, options)
        .then((res) => res.json())
        .then((results) => {
          const { data, status, message, statusCode } = results;

          if (status !== 200 && statusCode !== 200) {
            setClientsError(`Clients error: ${message}`);
            setLoadingClients(false);
            return;
          }

          setLoadingClients(false);
          setClientsInfo(data);

          // set clients to the local storage
          localStorage.setItem("clientsInfo", JSON.stringify(data));
        })
        .catch((error) => {
          setLoadingClients(false);
          setClientsError(`Clients error: ${error.message}`);
        });
    } else {
      setLoadingClients(false);
      setClientsError(`Clients error: token is invalid`);
    }
  }

  useEffect(() => {
    (async function login() {
      if (!isLoading && !user) {
        await loginWithRedirect();
      }
    })();
  }, [isLoading, user]); // eslint-disable-line

  useEffect(() => {
    if (isAuthenticated) {
      // fetch clients from the local storage
      const clientsInfoInLocalStorage = localStorage.getItem("clientsInfo");

      if (clientsInfoInLocalStorage) {
        setClientsInfo(JSON.parse(clientsInfoInLocalStorage));
      } else {
        getClientsData();
      }
    }
  }, [isAuthenticated]); // eslint-disable-line

  return (
    <>
      <header className="header">
        <Navbar bg="dark" variant="dark">
          <Container>
            <Nav
              className="d-flex align-items-center"
              activeKey={activeNav}
              onSelect={(selectedKey) => setActiveNav(selectedKey)}
            >
              <Navbar.Brand href="/">
                <Image src={logo} className="nav-logo" />{" "}
              </Navbar.Brand>
              {NAV_ITEMS.map(({ key, name, link }) => (
                <Nav.Item key={key} className="px-2">
                  <Link className="nav-link" to={link}>
                    {name}{" "}
                  </Link>
                </Nav.Item>
              ))}
            </Nav>
            <Nav className="justify-content-end">
              <Nav.Item>
                <Button
                  className="bg-transparent border-0"
                  onClick={() => {
                    logout({ returnTo: window.location.origin });
                    localStorage.removeItem("clientsInfo");
                  }}
                >
                  Log out
                </Button>
              </Nav.Item>
            </Nav>
          </Container>
        </Navbar>
      </header>
      <main className="main-container">
        <Container className="mt-5">
          {isLoading ? (
            <div className="center-vertically-block">
              <Spinner
                className="d-flex m-auto"
                animation="border"
                role="status"
              />
              <p className="pt-3">Loading user...</p>
            </div>
          ) : loadingClients ? (
            <div className="center-vertically-block">
              <Spinner
                className="d-flex m-auto"
                animation="border"
                role="status"
              />
              <p className="pt-3">Loading clients info...</p>
            </div>
          ) : clientsError ? (
            <div className="center-vertically-block">
              <Alert variant="danger">{clientsError}</Alert>
            </div>
          ) : (
            <Routes>
              {routes.map((route) => {
                return (
                  <Route
                    key={route.label}
                    index={route.index || false}
                    path={route.path}
                    element={<Page route={route} clientsInfo={clientsInfo} />}
                  />
                );
              })}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </Container>
      </main>
    </>
  );
};

export default withAuth0(App);
