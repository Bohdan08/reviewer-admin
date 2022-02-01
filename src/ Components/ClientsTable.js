import React from "react";
import { Alert, Table } from "react-bootstrap";

const TABLE_HEADERS = ["ID", "Name", "Uname", "Website"];

const ClientsTable = ({ clientsInfo = [] }) => (
  <div className="mt-5">
    <h2 className="text-center py-2"> Clients </h2>
    {clientsInfo.length ? (
      <Table bordered className="rounded">
        <thead>
          <tr>
            {TABLE_HEADERS.map((headerName) => (
              <th key={headerName}> {headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clientsInfo.map(({ id, name, uname, website }) => (
            <tr key={id}>
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
    ) : (
      <Alert className="m-auto w-50 text-center"> No Clients Found...</Alert>
    )}
  </div>
);

export default ClientsTable;
