import React from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const GlobalLoading: React.FC = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  
  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 32, color: "#1890ff" }} spin />}
        />
        <div style={{ marginTop: "16px", fontSize: "16px", color: "#666" }}>
          Loading...
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading;
