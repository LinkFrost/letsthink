import Spinner from "../other/Spinner";

type SuspendPropTypes = {
  children?: React.ReactNode;
  //   *Could consider adding this later, allowing us to pass a
  //   fallback component for error/loading states*
  //   fallback: () => React.ReactNode;
  loading: boolean;
  errored: boolean;
};

// Will make more robust if need be. For now keeping simple
// Takes in a loading state and an error state, and blocks until load is resolved.
// Resolves us of nesting too many ternary operators in our JSX
const Suspend = ({ children, loading, errored }: SuspendPropTypes) => {
  if (loading) {
    return <Spinner />;
  }
  if (errored) {
    return <div>Error</div>;
  }

  return <>{children}</>;
};

export default Suspend;
