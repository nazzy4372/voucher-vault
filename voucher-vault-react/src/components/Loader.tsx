import { Spin } from "antd";

const Loader = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "300px",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Spin />
    </div>
  );
};

export default Loader;
