export const rootRoutes = {
  Welcome: 'Welcome',
  AdultConfirmation: 'AdultConfirmation',
} as const;

export type RootStackParamList = {
  [Route in keyof typeof rootRoutes]: undefined;
};

export const rootRouteNames = Object.values(rootRoutes);
