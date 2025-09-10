"use client";
import ClipLoader from "react-spinners/ClipLoader";

interface LoadingPageProps {
  loading: boolean;
  size?: number;
  color?: string;
}

const override = {
  display: "block",
  margin: "100px auto",
};

const LoadingPage = ({ loading }: LoadingPageProps) => {
  return (
    <ClipLoader
      color="#3b82f6"
      loading={loading}
      cssOverride={override}
      size={150}
      aria-label="Loading Spinner"
    />
  );
};

export default LoadingPage;
