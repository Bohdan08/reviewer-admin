import {
  UploadFrom,
  ClientsTable,
  SelectedClientTable,
  SelectedPatiensTable,
  TestPatient
} from "../views";

const routes = [
  { path: "/", index: true, label: "Upload Form", Component: UploadFrom },
  {
    path: "/clients",
    label: "Clients",
    Component: ClientsTable,
    routes: [
      {
        path: "/:selectedClient",
        label: "Selected Client",
        Component: SelectedClientTable,
        routes: [
          {
            path: "/:selectedPatients",
            label: "Selected Patients",
            Component: SelectedPatiensTable,
          },
        ],
      },
    ],
  },
  {
    path: "/test-patient",
    label: "Test a Patient",
    Component: TestPatient,
  },
];

export default routes;
