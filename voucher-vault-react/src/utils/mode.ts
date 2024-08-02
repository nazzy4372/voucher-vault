export const checkForDevMode = () => {
  if (typeof window !== "undefined") {
    const queryString = window.location.search;
    const searchParams = new URLSearchParams(queryString);
    return searchParams.get("mode") === "dev";
  }
  return false;
};
