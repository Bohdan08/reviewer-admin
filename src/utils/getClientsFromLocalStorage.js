const getClientsFromLocalStorage = () => {
  // fetch clients from the local storage
  const clientsInfoInLocalStorage = localStorage.getItem("clientsInfo");

  if (clientsInfoInLocalStorage) {
    // setClientsInfo(JSON.parse(clientsInfoInLocalStorage));
    return JSON.parse(clientsInfoInLocalStorage);
  }

  return null;
};

export default getClientsFromLocalStorage;
