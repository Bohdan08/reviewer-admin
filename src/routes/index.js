import {
  UploadFrom,
  ClientsTable,
  SelectedClientTable,
  SelectedPatiensTable,
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
];

export default routes;
