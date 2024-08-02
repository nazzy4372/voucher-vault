import { notification } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";
import { createContext, ReactNode, useContext } from "react";

const NotificationContext = createContext<NotificationInstance>({
  // @ts-ignore
  name: "Default",
});

const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [api, contextHolder] = notification.useNotification({});

  return (
    <NotificationContext.Provider value={api}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

// Define hooks for accessing context
export function useNotificationContext() {
  return useContext(NotificationContext);
}

export default NotificationProvider;
