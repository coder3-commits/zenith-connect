import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vasApi } from "@/api/vas.api";
import type { AirtimePayload, DataPayload, ElectricityPayload, ExamPayload } from "@/types/vas";
import { queryKeys } from "./keys";
import { useSafeMutation } from "./useSafeMutation";

function invalidateMoney(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
  qc.invalidateQueries({ queryKey: queryKeys.transactions.list() });
}

export function useDataPlans(network: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vas.dataPlans(network ?? ""),
    queryFn: () => vasApi.dataPlans(network as string),
    enabled: Boolean(network),
    staleTime: 1000 * 60 * 30,
  });
}

export function useVerifyMeter() {
  return useMutation({
    mutationFn: (v: { disco: string; meterNumber: string; meterType: string }) =>
      vasApi.verifyMeter(v.disco, v.meterNumber, v.meterType),
  });
}

export function useBuyAirtime() {
  const qc = useQueryClient();
  return useSafeMutation<Awaited<ReturnType<typeof vasApi.buyAirtime>>, AirtimePayload>(
    ({ variables, idempotencyKey }) => vasApi.buyAirtime(variables, idempotencyKey),
    { onSuccess: () => invalidateMoney(qc) },
  );
}

export function useBuyData() {
  const qc = useQueryClient();
  return useSafeMutation<Awaited<ReturnType<typeof vasApi.buyData>>, DataPayload>(
    ({ variables, idempotencyKey }) => vasApi.buyData(variables, idempotencyKey),
    { onSuccess: () => invalidateMoney(qc) },
  );
}

export function usePayElectricity() {
  const qc = useQueryClient();
  return useSafeMutation<Awaited<ReturnType<typeof vasApi.payElectricity>>, ElectricityPayload>(
    ({ variables, idempotencyKey }) => vasApi.payElectricity(variables, idempotencyKey),
    { onSuccess: () => invalidateMoney(qc) },
  );
}

export function usePayExam() {
  const qc = useQueryClient();
  return useSafeMutation<Awaited<ReturnType<typeof vasApi.payExam>>, ExamPayload>(
    ({ variables, idempotencyKey }) => vasApi.payExam(variables, idempotencyKey),
    { onSuccess: () => invalidateMoney(qc) },
  );
}
