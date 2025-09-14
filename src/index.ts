import { ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";
import { withAndroidGradle } from "./withAndroidGradle";
import { withAndroidManifest } from "./withAndroidManifest";
import { withAndroidProguard } from "./withAndroidProguard";
import { withIOSAppDelegate } from "./withIOSAppDelegate";
import { withIOSBridgingHeader } from "./withIOSBridgingHeader";
import { withIOSCapabilities } from "./withIOSCapabilities";
import { withIOSPodfile } from "./withIOSPodfile";

export interface AliyunPushPluginOptions {
  // Android 厂商推送配置
  huawei?: {
    appId?: string;
  };
  vivo?: {
    apiKey?: string;
    appId?: string;
  };
  honor?: {
    appId?: string;
  };
  oppo?: {
    key?: string;
    secret?: string;
  };
  xiaomi?: {
    appId?: string;
    appKey?: string;
  };
  meizu?: {
    appId?: string;
    appKey?: string;
  };
  fcm?: {
    senderId?: string;
    applicationId?: string;
    projectId?: string;
    apiKey?: string;
  };
}

const withAliyunPush: ConfigPlugin<AliyunPushPluginOptions> = (
  config,
  options = {}
) => {
  // Android 配置
  config = withAndroidManifest(config, options);
  config = withAndroidGradle(config, options);
  config = withAndroidProguard(config, options);

  // iOS 配置
  config = withIOSPodfile(config, options);
  config = withIOSAppDelegate(config, options);
  config = withIOSCapabilities(config, options);
  config = withIOSBridgingHeader(config, options);

  return config;
};

const pkg = {
  name: "aliyun-react-native-push",
  version: "1.0.0",
};

export default createRunOncePlugin(withAliyunPush, pkg.name, pkg.version);
