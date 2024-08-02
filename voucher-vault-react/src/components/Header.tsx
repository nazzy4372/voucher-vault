import { Button, Layout, Typography, ConfigProvider } from "antd";
import { useSessionContext } from "../providers/ContextProvider";
import { useLocation, Link, useNavigate } from "react-router-dom";

import logo from "../assets/logo.svg";
import { useState } from "react";
const _Header = () => {
  const { session, brand, user } = useSessionContext();
  const navigate = useNavigate();
  const { Header } = Layout;
  const { pathname } = useLocation();

  const onLogoutClick = () => {
    window.location.pathname = "/register";
  };

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        background: "#5C3D00",
        position: "fixed",
        width: "100vw",
        zIndex: "100",
        height: "70px",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{ color: "#fff", height: "100%", cursor: "pointer" }}
        onClick={() => (window.location.pathname = "/register")}
      >
        <img src={logo} style={{ height: "60px", margin: "5px 0px" }} />
      </div>
      <div>
        <ConfigProvider theme={{ token: { colorPrimary: "#EA9A00" } }}>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              textTransform: "capitalize",
            }}
          >
            {user &&
              (pathname === "/minted-nft-vouchers" ? (
                <Button
                  type="primary"
                  onClick={() => {
                    navigate("/customer");
                  }}
                >
                  Home
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => {
                    navigate("/minted-nft-vouchers");
                  }}
                >
                  View Minted Vouchers
                </Button>
              ))}
            {brand && (
              <Typography.Text
                style={{
                  color: "#ffff",
                  fontWeight: "600",
                  flex: "1 0 max-content",
                }}
              >
                {brand.name}
              </Typography.Text>
            )}
            {session && (
              <Button type="dashed" htmlType="button" onClick={onLogoutClick}>
                Logout
              </Button>
            )}
          </div>
        </ConfigProvider>
      </div>
    </Header>
  );
};

export default _Header;
