import { useState } from "react";
import AWS from "aws-sdk";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { API_STATUS } from "./constants";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
});

const myBucket = new AWS.S3({
  params: { Bucket: process.env.REACT_APP_S3_BUCKET },
  region: process.env.REACT_APP_REGION,
});

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileStatus, setUploadedFileStatus] = useState(null);
  const [uploadedFileMessage, setUploadedFileMessage] = useState(null);

  const handleFileInput = (event) => {
    setUploadedFileMessage(null);
    setSelectedFile(event.target.files[0]);
  };

  const s3Upload = (file) => {
    const params = {
      ACL: "public-read",
      Body: file,
      Bucket: process.env.REACT_APP_S3_BUCKET,
      Key: file.name,
    };

    myBucket
      .putObject(params)
      .on("httpUploadProgress", (currentProgress) => {
        const { loaded, total } = currentProgress;
        if (loaded < total) {
          setUploadedFileStatus(API_STATUS.LOADING);
        } else if (loaded === total) {
          setUploadedFileStatus(API_STATUS.SUCCESS);
        }
      })
      .send((error) => {
        if (error) {
          setUploadedFileStatus(API_STATUS.ERROR);
          setUploadedFileMessage(error);
        }
      });
  };

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
          <input type="file" onChange={handleFileInput} />
          <Button
            variant="primary"
            type="button"
            className="w-100 mt-4"
            onClick={() => s3Upload(selectedFile)}
          >
            Upload
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default App;
