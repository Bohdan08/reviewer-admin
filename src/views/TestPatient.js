import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import formatInputPhoneNumber from "../utils/formatInputPhoneNumber";
import { API_STATUS } from "../constants";

const TestPatient = ({ clientsInfo }) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [phoneNumber, setPhoneNumber] = useState();
  const [phoneError, setPhoneError] = useState();
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [testPatientAPIStatus, setTestPatientAPIStatus] = useState(
    API_STATUS.IDLE
  );
  const [submitPatientAPIMessage, setSubmitPatientAPIMessage] = useState("");
  const [showInfoAlert, setShowInfoAlert] = useState(true);

  const validatePhoneNumber = (value) => {
    if (!value) {
      setPhoneError("A phone number is required");
      return false;
    } else if (value.length !== 10) {
      setPhoneError("Invalid Phone Format. ex: (555) 555-5555");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const handlePhoneNumber = (value) => {
    const valueWithOnlyNumbers = value.replace(/\D+/g, "");
    setPhoneNumber(valueWithOnlyNumbers);
    validatePhoneNumber(valueWithOnlyNumbers);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!phoneError && triedToSubmit) {
        validatePhoneNumber(phoneNumber);
      }
    }, 100);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triedToSubmit, phoneError]);

  const onTestPatient = () => {
    setTriedToSubmit(true);

    if (validatePhoneNumber(phoneNumber)) {
      submitSmsToPatient();
      return;
    }
  };

  const submitSmsToPatient = async () => {
    setTestPatientAPIStatus(API_STATUS.LOADING);
    const options = {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    };

    await fetch(
      `${process.env.REACT_APP_BASE_URL}/test/patient?phone=${phoneNumber}&client=${selectedClient}`,
      options
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.status !== 200) {
          setSubmitPatientAPIMessage(response.message);
          setTestPatientAPIStatus(API_STATUS.ERROR);
          return;
        }

        setTestPatientAPIStatus(API_STATUS.SUCCESS);
      })
      .catch(({ message }) => {
        setSubmitPatientAPIMessage(message);
        setTestPatientAPIStatus(API_STATUS.ERROR);
      });
  };

  return (
    <div className="d-flex justify-content-center h-100">
      <Container className="d-flex flex-column justify-content-center h-100">
        <h2 className="text-center pb-5"> Test a Patient </h2>
        <Form className="m-auto test-patient-form">
          {clientsInfo && (
            <>
              <Form.Label>Clinic</Form.Label>
              <Form.Select
                className="m-0"
                onChange={({ target }) => setSelectedClient(target.value)}
              >
                <option value=""> Please choose a clinic </option>
                {clientsInfo.map(({ uname }) => (
                  <option key={uname}>{uname}</option>
                ))}
              </Form.Select>

              <Form.Group className="mt-5 mb-3 ml-1">
                <Form.Label>Phone Number</Form.Label>
                <p className="phone-label">+1</p>
                <Form.Control
                  className={`phone-input ${
                    phoneError && triedToSubmit ? "phone-input-error" : ""
                  }`}
                  type="tel"
                  placeholder="(XXX) XXX-XXXX"
                  id="phone"
                  name="phone"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  required
                  value={formatInputPhoneNumber(phoneNumber)}
                  onChange={({ target }) => handlePhoneNumber(target.value)}
                />
                {phoneError && triedToSubmit ? (
                  <p className="mt-1 phone-error-label">{phoneError}</p>
                ) : null}
              </Form.Group>
              <Button
                disabled={phoneError || !selectedClient}
                variant="primary"
                type="button"
                className="w-100 mt-4"
                onClick={onTestPatient}
              >
                Test a Patient
              </Button>
            </>
          )}
        </Form>

        <div className="mt-5 mx-auto test-patient-info-alert-container">
          {testPatientAPIStatus === API_STATUS.LOADING && (
            <>
              <Spinner
                className="d-flex m-auto"
                animation="border"
                role="status"
              />
              <p className="pt-3 text-center">Loading...</p>
            </>
          )}
          {showInfoAlert ? (
            testPatientAPIStatus === API_STATUS.SUCCESS ? (
              <Alert
                variant="success"
                onClose={() => setShowInfoAlert(false)}
                dismissible
              >
                SMS has been sent to a patient succesffully
              </Alert>
            ) : testPatientAPIStatus === API_STATUS.ERROR ? (
              <Alert
                variant="danger"
                onClose={() => setShowInfoAlert(false)}
                dismissible
              >
                {submitPatientAPIMessage}
              </Alert>
            ) : null
          ) : null}
        </div>
      </Container>
    </div>
  );
};

export default TestPatient;
