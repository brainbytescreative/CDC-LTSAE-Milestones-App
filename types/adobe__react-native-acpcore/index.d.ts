declare module '@adobe/react-native-acpcore' {
  type ACPCore = {
    trackState: (stateKey: string, value: Record<string, string>) => void;
  };
  export const ACPCore: ACPCore;
}
