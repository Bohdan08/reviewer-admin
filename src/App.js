import { useState, useEffect } from "react";
import AWS from "aws-sdk";
import { useAuth0, withAuth0 } from "@auth0/auth0-react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { API_STATUS, CLIENT_API } from "./constants";

AWS.config.update({
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.REACT_APP_IDENTITY_POOL,
  }),
  region: process.env.REACT_APP_REGION,
});

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileStatus, setUploadedFileStatus] = useState(null);
  const [uploadedFileMessage, setUploadedFileMessage] = useState(null);
  const {
    isAuthenticated,
    loginWithRedirect,
    isLoading,
    user,
    logout,
  } = useAuth0();
  const [bucketName, setBucketName] = useState(null);
  const [bucketNameError, setBucketNameError] = useState(null);

  const handleFileInput = (event) => {
    setUploadedFileStatus(API_STATUS.IDLE);
    setUploadedFileMessage(null);
    setSelectedFile(event.target.files[0]);
  };

  const currentDate = new Date()
    .toISOString()
    .replace("T", "")
    .replace(/\D/g, "")
    .substr(0, 14);

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

  useEffect(() => {
    (async function login() {
      if (!isLoading && !user) {
        await loginWithRedirect();
      }
    })();
  }, [isLoading]); // eslint-disable-line

  useEffect(() => {
    if (isAuthenticated && bucketName === null) {
      fetch(`${process.env.REACT_APP_BASE_URL}${CLIENT_API}`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then(({ data: { uname } }) =>
          setBucketName(`${process.env.REACT_APP_S3_BUCKET}/${uname}`)
        )
        .catch((error) =>
          setBucketNameError(`Bucket path error: ${error.message}`)
        );
    }
  }, [isAuthenticated, bucketName]);

  return (
    <>
      <div className="position-absolute message-info mt-5">
        {uploadedFileStatus === API_STATUS.LOADING ? (
          <div> Loading... </div>
        ) : uploadedFileStatus === API_STATUS.SUCCESS ? (
          <Alert variant="success">
            A chosen file has been successfully uploaded to S3
          </Alert>
        ) : uploadedFileStatus === API_STATUS.ERROR ? (
          <Alert varian="danger">{uploadedFileMessage}</Alert>
        ) : bucketNameError ? (
          <Alert variant="danger">{bucketNameError}</Alert>
        ) : null}
      </div>

      <Container className="d-flex flex-column justify-content-center h-100">
        <Form className="m-auto">
          {isAuthenticated ? (
            <>
              {" "}
              <input
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
              <Button
                id="login-button"
                variant="danger"
                className="w-100 mt-4"
                onClick={() => logout({ returnTo: window.location.origin })}
              >
                Log Out
              </Button>
            </>
          ) : (
            <>
              {/* <Button
                id="login-button"
                variant="primary"
                className="w-100 mt-4"
                style={{ minWidth: "200px" }}
                onClick={() => loginWithRedirect()}
              >
                Log In
              </Button> */}
            </>
          )}
        </Form>
      </Container>
    </>
  );
};

export default withAuth0(App);
