///search actions
//===============
export var clearSearchParameters = () => {
  return {
    type: "CLEAR_SEARCH_PARAMETERS",
  };
};
export var setSearchParameters = (searchParameters) => {
  return {
    type: "SET_SEARCH_PARAMETERS",
    searchParameters
  };
};
