import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdultConfirmationScreen } from '../../features/onboarding';
import { WelcomeScreen } from '../../features/welcome';
import { navigationTheme } from '../../shared/theme/theme';

import { rootRoutes } from './routes';
import type { RootStackParamList } from './routes';

export type { RootStackParamList } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={rootRoutes.Welcome}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name={rootRoutes.Welcome}>
          {({ navigation }) => (
            <WelcomeScreen
              onBeginSetup={() =>
                navigation.navigate(rootRoutes.AdultConfirmation)
              }
            />
          )}
        </Stack.Screen>
        <Stack.Screen name={rootRoutes.AdultConfirmation}>
          {({ navigation }) => (
            <AdultConfirmationScreen onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
