export type AirtimePayload = {
  network: string;
  phone: string;
  amount: number;
  pin: string;
};

export type DataPlan = {
  id: string;
  name: string;
  price: number;
  validity?: string;
  network?: string;
};

export type DataPayload = {
  network: string;
  phone: string;
  planId: string;
  pin: string;
};

export type ElectricityPayload = {
  disco: string;
  meterNumber: string;
  meterType: "prepaid" | "postpaid";
  amount: number;
  pin: string;
};

export type ExamPayload = {
  examType: string;
  quantity: number;
  pin: string;
};

export type VasResult = {
  reference: string;
  status: "pending" | "processing" | "success" | "failed";
  fee?: number;
  token?: string;
  units?: string;
  pin?: string;
  serial?: string;
};
