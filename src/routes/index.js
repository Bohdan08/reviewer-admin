import { UploadFrom, ClientsTable, SelectedClientTable } from "../views";

const routes = [
  { path: "/", index: true, label: "Upload Form", Component: UploadFrom },
  {
    path: "/clients",
    index: false,
    label: "Clients",
    Component: ClientsTable,
    routes: [
      {
        path: "/:selectedClient",
        index: false,
        label: "Selected Client",
        Component: SelectedClientTable,
      },
    ],
  },
];

export default routes;
