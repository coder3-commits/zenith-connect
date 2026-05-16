export type KycStatus = "unverified" | "pending" | "verified" | "rejected";

export type User = {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  kyc_status?: KycStatus | string;
  roles?: string[];
};

export type Session = {
  token: string;
  user: User;
};
