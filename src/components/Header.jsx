import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import { FaBookOpen, FaFileUpload } from "react-icons/fa";
export const Header = () => {
  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      style={{ position: "sticky", top: "0", zIndex: 100 }}
      bg="dark"
      variant="dark"
    >
      <Container>
        <Navbar.Brand href="/" className="text-white">
          <FaBookOpen /> ReadEra - Book notes
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          className="text-white"
        />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto"></Nav>
          <Nav>
            <Nav.Link eventKey={2} href="/upload">
              <FaFileUpload className="m-1" />
              Upload backup
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
