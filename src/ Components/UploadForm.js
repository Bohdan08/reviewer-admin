import React, { useState, useEffect, useDebugValue } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AWS from "aws-sdk";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { API_STATUS, CLIENT_API } from "../constants";

AWS.config.update({
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.REACT_APP_IDENTITY_POOL,
  }),
  region: process.env.REACT_APP_REGION,
});

const currentDate = new Date()
  .toISOString()
  .replace("T", "")
  .replace(/\D/g, "")
  .substr(0, 14);

const mockData = [
  {
    id: 1,
    uname: "accuro",
    name: "Wilderman Medical Clinic",
    website: "https://drwilderman.com/dr-wilderman/",
    linkGoogleMobile: "https://g.page/r/CfZwMlYIc8AuEAo/review",
    logo: "logo.bc3311f1.png",
  },
  {
    id: 2,
    uname: "cosmetic",
    name: "Wilderman Cosmetic Clinic",
    website: "https://www.medicalcosmeticclinic.ca/",
    linkGoogleMobile: "https://g.page/r/CaCvhTvMAv9MEAo/review",
    logo: "logo.543e3158.png",
  },
];

const UploadForm = () => {
  const {
    // isAuthenticated,
    loginWithRedirect,
    isLoading,
    user,
    logout,
  } = useAuth0();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileStatus, setUploadedFileStatus] = useState(null);
  const [uploadedFileMessage, setUploadedFileMessage] = useState(null);
  const [bucketName, setBucketName] = useState(null);
  const [bucketNameError, setBucketNameError] = useState(null);

  // new flow

  const [selectedFolder, setSelectedFolder] = useState("");
  const [directPath, setDirectPath] = useState(false);

  const isAuthenticated = true;
  // useEffect(() => {
  //   if (isAuthenticated && bucketName === null) {
  //     fetch(`${process.env.REACT_APP_BASE_URL}${CLIENT_API}`, {
  //       method: "GET",
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         console.log(data, "datadata");
  //         const { uname } = data;
  //         setBucketName(`${process.env.REACT_APP_S3_BUCKET}/${uname}`);
  //       })
  //       .catch((error) =>
  //         setBucketNameError(`Bucket path error: ${error.message}`)
  //       );
  //   }
  // }, [isAuthenticated, bucketName]);

  // useEffect(() => {
  //   (async function login() {
  //     if (!isLoading && !user) {
  //       await loginWithRedirect();
  //     }
  //   })();
  // }, [isLoading]);

  const handleFileInput = (event) => {
    setUploadedFileStatus(API_STATUS.IDLE);
    setUploadedFileMessage(null);
    setSelectedFile(event.target.files[0]);
  };

  const s3Upload = (file) => {
    const fileFormat = file
      ? file.name.slice(file.name.length - 3, file.name.length)
      : "";

    try {
      let upload = new AWS.S3.ManagedUpload({
        params: {
          Body: file,
          Bucket: bucketName,
          // Key: file.name,
          Key: `import_${currentDate}.${fileFormat}`,
        },
      });

      let promise = upload.promise();

      promise.then(
        () => {
          setUploadedFileStatus(API_STATUS.SUCCESS);
          // alert("Successfully uploaded file.");
        },
        (error) => {
          setUploadedFileStatus(API_STATUS.ERROR);
          setUploadedFileMessage(error);
        }
      );
    } catch (error) {
      setUploadedFileStatus(API_STATUS.ERROR);
      setUploadedFileMessage(error);
    }
  };

  console.log(selectedFolder, "selectedFolder");
  return (
    <div id="uploadform" className="d-flex justify-content-center h-100">
      <div className="position-absolute message-info mt-5">
        {/* {uploadedFileStatus === API_STATUS.LOADING ? (
          <div> Loading... </div>
        ) : uploadedFileStatus === API_STATUS.SUCCESS ? (
          <Alert variant="success">
            A chosen file has been successfully uploaded to S3
          </Alert>
        ) : uploadedFileStatus === API_STATUS.ERROR ? (
          <Alert varian="danger">{uploadedFileMessage}</Alert>
        ) : bucketNameError ? (
          <Alert variant="danger">{bucketNameError}</Alert>
        ) : null} */}
        {/* <div> Loading... </div> */}
      </div>

      <Container className="d-flex flex-column justify-content-center h-100">
        <h2 className="text-center py-5"> Upload a file </h2>
        <Form className="m-auto">
          {isAuthenticated && (
            <>
              <Form.Select
                className="m-0"
                onChange={(event) => setSelectedFolder(event.target.value)}
              >
                <option value=""> Please choose a folder </option>
                {mockData.map(({ uname }) => (
                  <option key={uname}>{uname}</option>
                ))}
              </Form.Select>
              <Form.Group className="my-3" controlId="formBasicCheckbox">
                <Form.Check
                  type="checkbox"
                  label="Ideal"
                  checked
                  onChange={() => setDirectPath(!directPath)}
                />
              </Form.Group>
              <input
                disabled={!selectedFolder}
                type="file"
                onChange={handleFileInput}
                accept=".csv, .xml"
              />
              <Button
                disabled={!selectedFile}
                variant="primary"
                type="button"
                className="w-100 mt-4"
                onClick={() => selectedFile && s3Upload(selectedFile)}
              >
                Upload
              </Button>{" "}
              {/* <Button
                id="login-button"
                variant="danger"
                className="w-100 mt-4"
                onClick={() => logout({ returnTo: window.location.origin })}
              >
                Log Out
              </Button> */}
            </>
          )}
        </Form>
      </Container>
    </div>
  );
};

export default UploadForm;
