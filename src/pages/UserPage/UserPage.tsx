import obyte from "obyte";
import { Navigate, useParams } from "react-router";

export default () => {
  const { address } = useParams<{ address: string }>();

  if (!address || !obyte.utils.isValidAddress(address)) {
    return <Navigate to="/not-found" replace />;
  }

  return <div>UserPage - {address}</div>;
};

