import { createContext, useContext, useState } from "react";
import { Alert } from "antd";

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, description, type = "info", delay = null) => {
    const id = new Date().getTime();
    setAlerts((prev) => [...prev, { id, message, description, type }]);

    if (delay) {
      setTimeout(() => {
        removeAlert(id);
      }, delay * 1000);
    }
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[99999999999999] space-y-2">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            message={alert.message}
            description={alert.description}
            type={alert.type}
            showIcon
            closable
            onClose={() => removeAlert(alert.id)}
            className="mb-2"
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}
