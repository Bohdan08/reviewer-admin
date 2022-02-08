import React from "react";
import Breadcrumbs from "./Breadcrumbs";

const Page = ({ route, clientsInfo }) => {
  const PageBody = route.Component;

  return (
    <>
      {route.parent && <Breadcrumbs route={route} />}
      <PageBody clientsInfo={clientsInfo} />
    </>
  );
};

export default Page;
