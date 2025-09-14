import {
  ConfigPlugin,
  withEntitlementsPlist,
  withInfoPlist,
} from '@expo/config-plugins';
import { AliyunPushPluginOptions } from './index';

export const withIOSCapabilities: ConfigPlugin<AliyunPushPluginOptions> = (
  config,
  _options
) => {
  // 添加 Push Notifications capability 到 entitlements
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['aps-environment'] = 
      process.env.EAS_BUILD_PROFILE === 'production' ? 'production' : 'development';
    
    return config;
  });

  // 在 Info.plist 中添加 UIBackgroundModes
  config = withInfoPlist(config, (config) => {
    const backgroundModes = config.modResults.UIBackgroundModes || [];
    
    // 添加 remote-notification 如果不存在
    if (!backgroundModes.includes('remote-notification')) {
      backgroundModes.push('remote-notification');
    }
    
    // 添加 fetch 如果不存在（用于静默推送）
    if (!backgroundModes.includes('fetch')) {
      backgroundModes.push('fetch');
    }
    
    config.modResults.UIBackgroundModes = backgroundModes;
    
    return config;
  });

  return config;
};
