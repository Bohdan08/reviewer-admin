import React, { useState } from "react";
import AWS from "aws-sdk";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { API_STATUS } from "../constants";
import { useRef } from "react";

AWS.config.update({
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.REACT_APP_IDENTITY_POOL,
  }),
  region: process.env.REACT_APP_REGION,
});

const generateCurrentDate = () =>
  new Date().toISOString().replace("T", "").replace(/\D/g, "").substr(0, 14);

// const mockData = [
//   {
//     id: 1,
//     uname: "accuro",
//     name: "Wilderman Medical Clinic",
//     website: "https://drwilderman.com/dr-wilderman/",
//     linkGoogleMobile: "https://g.page/r/CfZwMlYIc8AuEAo/review",
//     logo: "logo.bc3311f1.png",
//   },
//   {
//     id: 2,
//     uname: "cosmetic",
//     name: "Wilderman Cosmetic Clinic",
//     website: "https://www.medicalcosmeticclinic.ca/",
//     linkGoogleMobile: "https://g.page/r/CaCvhTvMAv9MEAo/review",
//     logo: "logo.543e3158.png",
//   },
// ];

const UploadForm = ({ clientsInfo }) => {
  const inputFileRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileStatus, setUploadedFileStatus] = useState(null);
  const [uploadedFileMessage, setUploadedFileMessage] = useState(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [directPath, setDirectPath] = useState(undefined);
  const [infoAlert, setShowInfoAlert] = useState(true);

  const handleFileInput = (event) => {
    setUploadedFileStatus(API_STATUS.IDLE);
    setUploadedFileMessage(null);
    setSelectedFile(event.target.files[0]);
  };

  const s3Upload = (file) => {
    const fileFormat = file
      ? file.name.slice(file.name.length - 3, file.name.length)
      : "";

    const directKey = directPath ? "/direct" : "";

    try {
      let upload = new AWS.S3.ManagedUpload({
        params: {
          Body: file,
          // Bucket: bucketName,
          Bucket: `${process.env.REACT_APP_S3_BUCKET}/${selectedClient}${directKey}`,
          // Key: file.name,
          Key: `import_${generateCurrentDate()}.${fileFormat}`,
        },
      });

      let promise = upload.promise();

      promise.then(
        () => {
          setShowInfoAlert(true);
          setUploadedFileStatus(API_STATUS.SUCCESS);
          setSelectedFile(null);

          if (inputFileRef && inputFileRef.current) {
            inputFileRef.current.value = "";
          }
        },
        (error) => {
          setShowInfoAlert(true);
          setUploadedFileStatus(API_STATUS.ERROR);
          setUploadedFileMessage(error);
        }
      );
    } catch (error) {
      setShowInfoAlert(true);
      setUploadedFileStatus(API_STATUS.ERROR);
      setUploadedFileMessage(error);
    }
  };

  return (
    <div id="uploadform" className="d-flex justify-content-center h-100">
      <Container className="d-flex flex-column justify-content-center h-100">
        <h2 className="text-center pb-5"> Upload a file </h2>
        <Form className="m-auto">
          {clientsInfo && (
            <>
              <Form.Select
                className="m-0"
                onChange={(event) => setSelectedClient(event.target.value)}
              >
                <option value=""> Please choose a folder </option>
                {clientsInfo.map(({ uname }) => (
                  <option key={uname}>{uname}</option>
                ))}
              </Form.Select>
              <Form.Group className="my-3 ml-1" controlId="formBasicCheckbox">
                <p className="fs-5 mb-2"> Direct link?</p>
                <div className="mb-1">
                  <Form.Check
                    type="radio"
                    label="Yes"
                    checked={directPath}
                    onChange={() => setDirectPath(true)}
                  />
                </div>
                <div className="mb-1">
                  <Form.Check
                    type="radio"
                    label="No"
                    checked={directPath === false}
                    onChange={() => setDirectPath(false)}
                  />
                </div>

                {/* <Form.Check
                  type="checkbox"
                  label="Direct"
                  onChange={() => setDirectPath(!directPath)}
                /> */}
              </Form.Group>
              <input
                ref={inputFileRef}
                disabled={!selectedClient || directPath === undefined}
                type="file"
                onChange={handleFileInput}
                accept=".csv, .xml"
              />
              <Button
                disabled={!selectedFile}
                variant="primary"
                type="button"
                className="w-100 mt-4"
                onClick={() => s3Upload(selectedFile)}
              >
                Upload
              </Button>{" "}
            </>
          )}
        </Form>

        <div className="mt-5 mx-auto upload-form-status-container">
          {uploadedFileStatus === API_STATUS.LOADING && (
            <>
              <Spinner
                className="d-flex m-auto"
                animation="border"
                role="status"
              />
              <p className="pt-3">Loading...</p>
            </>
          )}
          {infoAlert ? (
            uploadedFileStatus === API_STATUS.SUCCESS ? (
              <Alert
                variant="success"
                onClose={() => setShowInfoAlert(false)}
                dismissible
              >
                The file has been successfully uploaded to S3
              </Alert>
            ) : uploadedFileStatus === API_STATUS.ERROR ? (
              <Alert varian="danger" onClose={() => setShowInfoAlert(false)}>
                {uploadedFileMessage}
              </Alert>
            ) : null
          ) : null}
        </div>
      </Container>
    </div>
  );
};

export default UploadForm;
