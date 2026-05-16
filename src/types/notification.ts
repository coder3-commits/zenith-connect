export type AppNotification = {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  createdAt: string;
  type?: string;
  meta?: Record<string, unknown>;
};
