declare module '@adobe/react-native-acpanalytics' {
  export class ACPAnalytics {
    public static registerExtension(): void;
    public static extensionVersion(): Promise<string>;
  }
}
