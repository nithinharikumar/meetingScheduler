export const queryKeys = {
  meetings: (filters?: Record<string, any>) => ['meetings', filters] as const,
  meeting: (id: string) => ['meeting', id] as const,
  dashboard: (date: string) => ['dashboard', date] as const,
  rooms: ['rooms'] as const,
};
