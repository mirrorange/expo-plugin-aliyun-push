import { ConfigPlugin, IOSConfig } from "@expo/config-plugins";
import { AliyunPushPluginOptions } from "./index";

const { withBuildSourceFile } = IOSConfig.XcodeProjectFile;

const SWIFT_FILE_PATH = "AliyunPushExpoModule.swift";
const SWIFT_FILE_CONTENT = `import ExpoModulesCore
import UserNotifications
import AliyunReactNativePush

private let aliyunPushDelegate = AliyunPushExpoAppDelegate()

public class AliyunPushExpoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AliyunPushExpoModule")
    AppDelegateSubscriber(aliyunPushDelegate)
  }
}

private class AliyunPushExpoAppDelegate: NSObject, ExpoAppDelegateSubscriber, UNUserNotificationCenterDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    if UNUserNotificationCenter.current().delegate == nil {
      UNUserNotificationCenter.current().delegate = self
    }
    return true
  }

  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    AliyunPush.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
  }

  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    AliyunPush.didFailToRegisterForRemoteNotificationsWithError(error)
  }

  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any]
  ) {
    AliyunPush.didReceiveRemoteNotification(userInfo)
  }

  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    AliyunPush.didReceiveRemoteNotification(userInfo, fetchCompletionHandler: completionHandler)
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    AliyunPush.userNotificationCenter(
      center,
      willPresent: notification,
      withCompletionHandler: completionHandler
    )
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    AliyunPush.userNotificationCenter(
      center,
      didReceive: response,
      withCompletionHandler: completionHandler
    )
  }
}
`;

export const withIOSAppDelegate: ConfigPlugin<AliyunPushPluginOptions> = (
  config,
  _options
) => {
  return withBuildSourceFile(config, {
    filePath: SWIFT_FILE_PATH,
    contents: SWIFT_FILE_CONTENT,
    overwrite: true,
  });
};
