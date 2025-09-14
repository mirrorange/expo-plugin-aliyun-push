import {
  ConfigPlugin,
  withAppDelegate,
  IOSConfig,
} from '@expo/config-plugins';
import { AliyunPushPluginOptions } from './index';

// 需要导入的头文件
const IMPORT_HEADER = '#import <AliyunReactNativePush/AliyunReactNativePush.h>';

// 需要添加到 didFinishLaunchingWithOptions 的代码
const DID_FINISH_LAUNCHING_CODE = `  [UNUserNotificationCenter currentNotificationCenter].delegate = self;`;

// APNs 注册成功的回调方法
const REGISTER_SUCCESS_METHOD = `
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [AliyunPush didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}`;

// APNs 注册失败的回调方法
const REGISTER_FAILED_METHOD = `
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [AliyunPush didFailToRegisterForRemoteNotificationsWithError:error];
}`;

// 接收静默通知的回调方法
const RECEIVE_SILENT_NOTIFICATION_METHOD = `
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  [AliyunPush didReceiveRemoteNotification:userInfo];
}`;

// 接收静默通知（带完成回调）的回调方法
const RECEIVE_SILENT_NOTIFICATION_WITH_COMPLETION_METHOD = `
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  [AliyunPush didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}`;

// 前台收到通知的回调方法
const WILL_PRESENT_NOTIFICATION_METHOD = `
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  [AliyunPush userNotificationCenter:center
             willPresentNotification:notification
               withCompletionHandler:completionHandler];
}`;

// 点击通知响应的回调方法
const DID_RECEIVE_NOTIFICATION_RESPONSE_METHOD = `
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler {
  [AliyunPush userNotificationCenter:center
      didReceiveNotificationResponse:response
               withCompletionHandler:completionHandler];
}`;

export const withIOSAppDelegate: ConfigPlugin<AliyunPushPluginOptions> = (
  config,
  _options
) => {
  return withAppDelegate(config, (config) => {
    let appDelegate = config.modResults.contents;

    // 添加导入语句
    if (!appDelegate.includes(IMPORT_HEADER)) {
      // 在最后一个 #import 后面添加
      const lastImportIndex = appDelegate.lastIndexOf('#import');
      if (lastImportIndex !== -1) {
        const endOfLineIndex = appDelegate.indexOf('\n', lastImportIndex);
        appDelegate = 
          appDelegate.slice(0, endOfLineIndex + 1) +
          IMPORT_HEADER + '\n' +
          appDelegate.slice(endOfLineIndex + 1);
      }
    }

    // 在 didFinishLaunchingWithOptions 中添加 delegate 设置
    if (!appDelegate.includes('[UNUserNotificationCenter currentNotificationCenter].delegate')) {
      const didFinishPattern = /application[^{]*didFinishLaunchingWithOptions[^{]*{/;
      const match = appDelegate.match(didFinishPattern);
      
      if (match) {
        const insertPosition = match.index! + match[0].length;
        appDelegate = 
          appDelegate.slice(0, insertPosition) +
          '\n' + DID_FINISH_LAUNCHING_CODE +
          appDelegate.slice(insertPosition);
      }
    }

    // 添加各个回调方法
    const methods = [
      { pattern: 'didRegisterForRemoteNotificationsWithDeviceToken', code: REGISTER_SUCCESS_METHOD },
      { pattern: 'didFailToRegisterForRemoteNotificationsWithError', code: REGISTER_FAILED_METHOD },
      { pattern: 'didReceiveRemoteNotification.*userInfo(?!.*fetchCompletionHandler)', code: RECEIVE_SILENT_NOTIFICATION_METHOD },
      { pattern: 'didReceiveRemoteNotification.*fetchCompletionHandler', code: RECEIVE_SILENT_NOTIFICATION_WITH_COMPLETION_METHOD },
      { pattern: 'willPresentNotification', code: WILL_PRESENT_NOTIFICATION_METHOD },
      { pattern: 'didReceiveNotificationResponse', code: DID_RECEIVE_NOTIFICATION_RESPONSE_METHOD },
    ];

    // 找到 @implementation AppDelegate 的结束位置（@end 之前）
    const implementationMatch = appDelegate.match(/@implementation\s+AppDelegate[\s\S]*?@end/);
    
    if (implementationMatch) {
      let implementation = implementationMatch[0];
      const endPosition = implementation.lastIndexOf('@end');
      
      methods.forEach(({ pattern, code }) => {
        const regex = new RegExp(pattern);
        if (!regex.test(implementation)) {
          // 在 @end 之前插入方法
          implementation = 
            implementation.slice(0, endPosition) +
            code + '\n\n' +
            implementation.slice(endPosition);
        }
      });

      // 替换原来的 implementation
      appDelegate = appDelegate.replace(implementationMatch[0], implementation);
    }

    config.modResults.contents = appDelegate;
    return config;
  });
};
