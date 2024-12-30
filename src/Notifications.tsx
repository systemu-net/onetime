import { createContext, ReactNode, useContext, useState } from "react";
import Notification from "./components/elements/notification";

type Notification = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void;
  removeNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      {notifications.map((notification) => (
        <Notification key={notification.id} text={notification.message} autoDismiss={true} dismissTimeout={3000} />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};
