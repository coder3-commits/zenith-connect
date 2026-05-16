import { apiClient } from "./client";
import type { AirtimePayload, DataPayload, DataPlan, ElectricityPayload, ExamPayload, VasResult } from "@/types/vas";

export const vasApi = {
  buyAirtime: (body: AirtimePayload, idempotencyKey: string) =>
    apiClient.post<VasResult>("/vas/airtime", body, { idempotencyKey }),
  dataPlans: (network: string) =>
    apiClient.get<{ plans: DataPlan[] } | DataPlan[]>("/vas/data/plans", { query: { network } }),
  buyData: (body: DataPayload, idempotencyKey: string) =>
    apiClient.post<VasResult>("/vas/data", body, { idempotencyKey }),
  payElectricity: (body: ElectricityPayload, idempotencyKey: string) =>
    apiClient.post<VasResult>("/vas/electricity", body, { idempotencyKey }),
  verifyMeter: (disco: string, meterNumber: string, meterType: string) =>
    apiClient.get<{ customerName: string; address?: string }>("/vas/electricity/verify", {
      query: { disco, meterNumber, meterType },
    }),
  payExam: (body: ExamPayload, idempotencyKey: string) =>
    apiClient.post<VasResult>("/vas/exam", body, { idempotencyKey }),
};
