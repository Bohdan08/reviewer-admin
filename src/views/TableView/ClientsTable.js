import React from "react";
import { Alert, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const TABLE_HEADERS = ["ID", "Name", "Uname", "Website"];

const ClientsTable = ({ clientsInfo = [] }) => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-center pb-2"> Clients </h2>
      {clientsInfo.length ? (
        <>
          <Table bordered hover className="rounded">
            <thead>
              <tr>
                {TABLE_HEADERS.map((headerName) => (
                  <th key={headerName}> {headerName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientsInfo.map(({ id, name, uname, website }) => (
                <tr
                  key={id}
                  className="cursor-pointer"
                  onClick={() => {
                    navigate(uname);
                  }}
                >
                  <td className="text-capitalize">{id}</td>
                  <td className="text-capitalize">{name}</td>
                  <td className="text-capitalize">{uname}</td>
                  <td>
                    <a href={website} target="_blank" rel="noreferrer">
                      {website}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <Alert className="m-auto w-50 text-center"> No Clients Found...</Alert>
      )}
    </div>
  );
};

export default ClientsTable;
