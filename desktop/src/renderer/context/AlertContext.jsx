import { createContext, useContext, useState } from "react";
import { Alert } from "antd";

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, description, type = "info") => {
    const id = new Date().getTime();
    setAlerts((prev) => [...prev, { id, message, description, type }]);
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      {children}
      <div style={{ position: "fixed", top: 16, left: 16, zIndex: 1000 }}>
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            message={alert.message}
            description={alert.description}
            type={alert.type}
            showIcon
            closable
            onClose={() => removeAlert(alert.id)}
            style={{ marginBottom: 8 }}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}
