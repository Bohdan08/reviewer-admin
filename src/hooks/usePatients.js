import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "react-query";
import { PATIENTS_API } from "../constants";

const usePatients = (
  activePageNumber = 1,
  selectedPatientsId,
  customQueryOptions = {}
) => {
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();

  const fetchPatients = async (selectedPage = 1) => {
    const tokenAccess = await getAccessTokenSilently();
    const userInfo = await getIdTokenClaims();

    if (tokenAccess && userInfo) {
      const options = {
        method: "GET",
        headers: {
          Authorization: userInfo?.__raw,
        },
      };

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}${PATIENTS_API}/${selectedPatientsId}/patients?page=${selectedPage}`,
        options
      )
        .then((res) => res.json())
        .then(({ status, data, error, message, pageInfo }) => {
          if (status !== 200) {
            return {
              data: [],
              header: `${error}: ${status}`,
              message,
              status,
            };
          }

          return { data, pageInfo };
        })
        .catch(({ message }) => {
          return {
            data: [],
            message,
          };
        });

      return response;
    }
    return;
  };

  const queryOptions = {
    ...customQueryOptions,
    keepPreviousData: true,
  };

  console.log(queryOptions, "queryOptions");

  return useQuery(
    ["selectedPatients", activePageNumber],
    () => fetchPatients(activePageNumber),
    queryOptions
  );
};

export default usePatients;
