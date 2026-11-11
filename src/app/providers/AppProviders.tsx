import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { environment } from '../bootstrap/config';

const EnvironmentContext = createContext(environment);

export function useEnvironment() {
  return useContext(EnvironmentContext);
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <EnvironmentContext.Provider value={environment}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </EnvironmentContext.Provider>
  );
}
