import { useState, useEffect } from "react";
import { useAuth0, withAuth0 } from "@auth0/auth0-react";
import { Container, Nav, Navbar, Image } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UploadForm from "./ Components/UploadForm";
import CustomerTable from "./ Components/CustomerTable";
// const NAV_LIST = ['UserTable'];
import logo from "./assets/logo.png";

const NAV_ITEMS = [
  {
    key: "uploadForm",
    name: "Upload File",
    link: "/",
    exact: true,
    Component: UploadForm,
  },
  {
    key: "customerTable",
    name: "Customers Info",
    link: "/customers",
    exact: false,
    Component: CustomerTable,
  },
];

const App = () => {
  const { loginWithRedirect, isLoading, user, isAuthenticated } = useAuth0();
  const [activeNav, setActiveNav] = useState(NAV_ITEMS[0].key);

  useEffect(() => {
    (async function login() {
      if (!isLoading && !user) {
        console.log("HERE");
        await loginWithRedirect();
      }
    })();
  }, [isLoading, user]); // eslint-disable-line

  console.log(isAuthenticated, "isAuthenticated");
  // console.log(user, "user");

  // console.log(user, "activeNav", isLoading);
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
              {NAV_ITEMS.map(({ key, name, link, Component }) => (
                <Nav.Item key={key} className="px-2">
                  <Link className="nav-link" to={link}>
                    {name}{" "}
                  </Link>
                </Nav.Item>
              ))}
            </Nav>
          </Container>
        </Navbar>
      </header>
      <main className="main-container">
        {/* <Container> */}
          <Routes>
            <Route path="/" element={<UploadForm />}></Route>
            <Route path="/customers" element={<CustomerTable />}></Route>
          </Routes>
        {/* </Container> */}
      </main>
    </>
  );
};

export default withAuth0(App);
