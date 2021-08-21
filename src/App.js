import { useState } from "react";
import AWS from "aws-sdk";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { API_STATUS } from "./constants";

AWS.config.update({
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.REACT_APP_IDENTITY_POOL,
  }),
  region: process.env.REACT_APP_REGION,
});

const currentDate = new Date()
  .toISOString()
  .replaceAll("T", "")
  .replaceAll(/\D/g, "")
  .substr(0, 14);

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileStatus, setUploadedFileStatus] = useState(null);
  const [uploadedFileMessage, setUploadedFileMessage] = useState(null);

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
          Bucket: process.env.REACT_APP_S3_BUCKET,
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
      console.log(error, "error");
      setUploadedFileStatus(API_STATUS.ERROR);
      setUploadedFileMessage(error);
    }
  };

  console.log(selectedFile, "selectedFile");
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
          <div>{uploadedFileMessage}</div>
        ) : null}
      </div>

      <Container className="d-flex flex-column justify-content-center h-100">
        <Form className="m-auto">
          <input type="file" onChange={handleFileInput} accept=".csv, .xml" />
          <Button
            disabled={!selectedFile}
            variant="primary"
            type="button"
            className="w-100 mt-4"
            onClick={() => selectedFile && s3Upload(selectedFile)}
          >
            Upload
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default App;
