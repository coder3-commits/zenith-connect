// Central, typed query-key factory. Use these everywhere instead of inline arrays.

export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  wallet: {
    root: () => ["wallet"] as const,
    balance: () => ["wallet", "balance"] as const,
    banks: () => ["wallet", "banks"] as const,
    verify: (bankCode: string, accountNumber: string) =>
      ["wallet", "verify", bankCode, accountNumber] as const,
  },
  transactions: {
    list: (params?: Record<string, unknown>) => ["transactions", "list", params ?? {}] as const,
    detail: (id: string) => ["transactions", "detail", id] as const,
  },
  notifications: {
    list: () => ["notifications", "list"] as const,
  },
  profile: {
    me: () => ["profile", "me"] as const,
  },
  vas: {
    dataPlans: (network: string) => ["vas", "data-plans", network] as const,
    meter: (disco: string, meter: string, type: string) =>
      ["vas", "meter", disco, meter, type] as const,
  },
  crypto: {
    rates: () => ["crypto", "rates"] as const,
  },
} as const;
