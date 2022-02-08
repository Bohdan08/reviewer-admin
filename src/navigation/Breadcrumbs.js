import React from "react";
import { Breadcrumb } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import { pathTo } from "./utils";

const Breadcrumbs = ({ route }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const formattedPath = currentPath.slice(1).split("/");

  let allVisitedPaths = [];

  if (!!formattedPath.length) {
    formattedPath.forEach((_, index) =>
      allVisitedPaths.push(formattedPath.slice(0, index + 1).join("/"))
    );
  }

  const currentCrumbName = location.pathname.split("/").pop();

  return (
    <Breadcrumb className="breadcrumbs">
      {pathTo(route).map((crumb, index, breadcrumbs) => {
        return (
          <Breadcrumb.Item key={index}>
            {index < breadcrumbs.length - 1 && (
              <NavLink
                to={
                  index > 0
                    ? `/${allVisitedPaths[index]}${location.search}`
                    : crumb.path
                }
              >
                <span className="text-capitalize">
                  {allVisitedPaths[index]?.split("/").pop() || crumb.label}
                </span>
              </NavLink>
            )}
            <span className="cursor-default-important text-capitalize">
              {index === breadcrumbs.length - 1 &&
                (currentCrumbName || crumb.label)}
            </span>
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
