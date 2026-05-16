import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { useRef } from "react";

/**
 * useSafeMutation — wrapper around React Query's useMutation that:
 *  - generates a stable per-attempt idempotency key (passed to the mutationFn)
 *  - blocks re-fire while a request is in flight
 *  - rotates the key on successful settle so the next attempt is a new request
 *
 * The mutationFn receives `{ variables, idempotencyKey }`.
 */
export function useSafeMutation<TData, TVars>(
  mutationFn: (args: { variables: TVars; idempotencyKey: string }) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, unknown, TVars>, "mutationFn">,
) {
  const keyRef = useRef<string>(makeKey());

  const m = useMutation<TData, unknown, TVars>({
    ...options,
    mutationFn: async (variables) => {
      const idempotencyKey = keyRef.current;
      return mutationFn({ variables, idempotencyKey });
    },
    onSettled: (...args) => {
      // Rotate key for next attempt so legitimate retries aren't deduped server-side.
      keyRef.current = makeKey();
      options?.onSettled?.(...args);
    },
  });

  // Guard against double-clicks while pending.
  const safeMutate = (vars: TVars) => {
    if (m.isPending) return;
    m.mutate(vars);
  };
  const safeMutateAsync = async (vars: TVars) => {
    if (m.isPending) return undefined as unknown as TData;
    return m.mutateAsync(vars);
  };

  return Object.assign(m, { safeMutate, safeMutateAsync });
}

function makeKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
