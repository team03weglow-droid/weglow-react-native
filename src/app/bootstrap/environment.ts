export type AppEnvironment = 'development' | 'staging' | 'production';

export type Environment = Readonly<{
  appEnvironment: AppEnvironment;
}>;

type EnvironmentInput = {
  appEnvironment: string | undefined;
};

export function parseEnvironment(input: EnvironmentInput): Environment {
  const appEnvironment = input.appEnvironment ?? 'development';

  if (
    appEnvironment !== 'development' &&
    appEnvironment !== 'staging' &&
    appEnvironment !== 'production'
  ) {
    // Report the variable name, never interpolate potentially sensitive values.
    throw new Error(
      'EXPO_PUBLIC_APP_ENV must be development, staging, or production.',
    );
  }

  return Object.freeze({ appEnvironment });
}
