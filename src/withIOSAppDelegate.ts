import { ConfigPlugin, withAppDelegate } from "@expo/config-plugins";
import { AliyunPushPluginOptions } from "./index";

const IMPORT_HEADER = "#import <AliyunReactNativePush/AliyunReactNativePush.h>";

const DID_FINISH_LAUNCHING_CODE = `  [UNUserNotificationCenter currentNotificationCenter].delegate = self;`;

const REGISTER_SUCCESS_METHOD = `
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [AliyunPush didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}`;

const REGISTER_FAILED_METHOD = `
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [AliyunPush didFailToRegisterForRemoteNotificationsWithError:error];
}`;

const RECEIVE_SILENT_NOTIFICATION_METHOD = `
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  [AliyunPush didReceiveRemoteNotification:userInfo];
}`;

const RECEIVE_SILENT_NOTIFICATION_WITH_COMPLETION_METHOD = `
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  [AliyunPush didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}`;

const WILL_PRESENT_NOTIFICATION_METHOD = `
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  [AliyunPush userNotificationCenter:center
             willPresentNotification:notification
               withCompletionHandler:completionHandler];
}`;

const DID_RECEIVE_NOTIFICATION_RESPONSE_METHOD = `
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler {
  [AliyunPush userNotificationCenter:center
      didReceiveNotificationResponse:response
               withCompletionHandler:completionHandler];
}`;

const SWIFT_IMPORT = "import UserNotifications";

const SWIFT_DID_FINISH_LAUNCHING_CODE =
  "    UNUserNotificationCenter.current().delegate = self";

const SWIFT_REGISTER_SUCCESS_METHOD = `
  public override func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    AliyunPush.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
  }`;

const SWIFT_REGISTER_FAILED_METHOD = `
  public override func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    AliyunPush.didFailToRegisterForRemoteNotificationsWithError(error)
  }`;

const SWIFT_RECEIVE_SILENT_NOTIFICATION_METHOD = `
  public func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any]
  ) {
    AliyunPush.didReceiveRemoteNotification(userInfo)
  }`;

const SWIFT_RECEIVE_SILENT_NOTIFICATION_WITH_COMPLETION_METHOD = `
  public override func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    AliyunPush.didReceiveRemoteNotification(userInfo, fetchCompletionHandler: completionHandler)
  }`;

const SWIFT_WILL_PRESENT_NOTIFICATION_METHOD = `
  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    AliyunPush.userNotificationCenter(
      center,
      willPresent: notification,
      withCompletionHandler: completionHandler
    )
  }`;

const SWIFT_DID_RECEIVE_NOTIFICATION_RESPONSE_METHOD = `
  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    AliyunPush.userNotificationCenter(
      center,
      didReceive: response,
      withCompletionHandler: completionHandler
    )
  }`;

export const withIOSAppDelegate: ConfigPlugin<AliyunPushPluginOptions> = (
  config,
  _options
) => {
  return withAppDelegate(config, (config) => {
    if (config.modResults.language === "swift") {
      config.modResults.contents = configureSwiftAppDelegate(
        config.modResults.contents
      );
    } else {
      config.modResults.contents = configureObjcAppDelegate(
        config.modResults.contents
      );
    }
    return config;
  });
};

function configureObjcAppDelegate(contents: string): string {
  if (!contents.includes(IMPORT_HEADER)) {
    const lastImportIndex = contents.lastIndexOf("#import");
    if (lastImportIndex !== -1) {
      const endOfLineIndex = contents.indexOf("\n", lastImportIndex);
      contents =
        contents.slice(0, endOfLineIndex + 1) +
        IMPORT_HEADER +
        "\n" +
        contents.slice(endOfLineIndex + 1);
    }
  }

  if (
    !contents.includes(
      "[UNUserNotificationCenter currentNotificationCenter].delegate"
    )
  ) {
    const didFinishPattern =
      /application[^{]*didFinishLaunchingWithOptions[^{]*{/;
    const match = contents.match(didFinishPattern);

    if (match) {
      const insertPosition = match.index! + match[0].length;
      contents =
        contents.slice(0, insertPosition) +
        "\n" +
        DID_FINISH_LAUNCHING_CODE +
        contents.slice(insertPosition);
    }
  }

  const methods = [
    {
      pattern: "didRegisterForRemoteNotificationsWithDeviceToken",
      code: REGISTER_SUCCESS_METHOD,
    },
    {
      pattern: "didFailToRegisterForRemoteNotificationsWithError",
      code: REGISTER_FAILED_METHOD,
    },
    {
      pattern:
        "didReceiveRemoteNotification.*userInfo(?!.*fetchCompletionHandler)",
      code: RECEIVE_SILENT_NOTIFICATION_METHOD,
    },
    {
      pattern: "didReceiveRemoteNotification.*fetchCompletionHandler",
      code: RECEIVE_SILENT_NOTIFICATION_WITH_COMPLETION_METHOD,
    },
    {
      pattern: "willPresentNotification",
      code: WILL_PRESENT_NOTIFICATION_METHOD,
    },
    {
      pattern: "didReceiveNotificationResponse",
      code: DID_RECEIVE_NOTIFICATION_RESPONSE_METHOD,
    },
  ];

  const implementationMatch = contents.match(
    /@implementation\s+AppDelegate[\s\S]*?@end/
  );

  if (implementationMatch) {
    let implementation = implementationMatch[0];
    const endPosition = implementation.lastIndexOf("@end");

    methods.forEach(({ pattern, code }) => {
      const regex = new RegExp(pattern);
      if (!regex.test(implementation)) {
        implementation =
          implementation.slice(0, endPosition) +
          code +
          "\n\n" +
          implementation.slice(endPosition);
      }
    });

    contents = contents.replace(implementationMatch[0], implementation);
  }

  contents = contents.replace(/\n{3,}/g, "\n\n");

  return contents;
}

function configureSwiftAppDelegate(contents: string): string {
  if (!contents.includes(SWIFT_IMPORT)) {
    const importRegex = /^import .*$/gm;
    let lastMatch: RegExpExecArray | null = null;
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(contents))) {
      lastMatch = match;
    }

    if (lastMatch) {
      const insertIndex = lastMatch.index + lastMatch[0].length;
      contents =
        contents.slice(0, insertIndex) +
        `\n${SWIFT_IMPORT}` +
        contents.slice(insertIndex);
    } else {
      contents = `${SWIFT_IMPORT}\n${contents}`;
    }
  }

  if (!contents.includes(SWIFT_DID_FINISH_LAUNCHING_CODE.trim())) {
    const didFinishRegex =
      /(didFinishLaunchingWithOptions[\s\S]*?->\s*Bool\s*{\n)/;
    const match = contents.match(didFinishRegex);
    if (match && match.index !== undefined) {
      const insertPosition = match.index + match[0].length;
      contents =
        contents.slice(0, insertPosition) +
        `${SWIFT_DID_FINISH_LAUNCHING_CODE}\n` +
        contents.slice(insertPosition);
    }
  }

  const classDeclarationWithBraceRegex =
    /(class\s+AppDelegate\s*:\s*[^\n{]+)(\s*\{)/;
  const classMatch = contents.match(classDeclarationWithBraceRegex);
  if (classMatch) {
    const [fullMatch, prefix, brace] = classMatch;
    if (!prefix.includes("UNUserNotificationCenterDelegate")) {
      const prefixWithoutTrailing = prefix.replace(/\s+$/, "");
      const updated = `${prefixWithoutTrailing}, UNUserNotificationCenterDelegate {`;
      contents = contents.replace(fullMatch, updated);
    }
  }

  const swiftMethods = [
    {
      check: "didRegisterForRemoteNotificationsWithDeviceToken",
      code: SWIFT_REGISTER_SUCCESS_METHOD,
    },
    {
      check: "didFailToRegisterForRemoteNotificationsWithError",
      code: SWIFT_REGISTER_FAILED_METHOD,
    },
    {
      check: "didReceiveRemoteNotification userInfo: [AnyHashable: Any]",
      code: SWIFT_RECEIVE_SILENT_NOTIFICATION_METHOD,
    },
    {
      check: "didReceiveRemoteNotification userInfo: [AnyHashable: Any],",
      code: SWIFT_RECEIVE_SILENT_NOTIFICATION_WITH_COMPLETION_METHOD,
    },
    {
      check: "willPresent notification: UNNotification",
      code: SWIFT_WILL_PRESENT_NOTIFICATION_METHOD,
    },
    {
      check: "didReceive response: UNNotificationResponse",
      code: SWIFT_DID_RECEIVE_NOTIFICATION_RESPONSE_METHOD,
    },
  ];

  const classBodyRegex = /(class\s+AppDelegate[\s\S]*?\n}\n)/;
  const classBodyMatch = contents.match(classBodyRegex);

  if (classBodyMatch) {
    let classBody = classBodyMatch[0];
    swiftMethods.forEach(({ check, code }) => {
      if (!classBody.includes(check)) {
        classBody = classBody.replace(/\n}\n$/, `\n\n${code}\n}\n`);
      }
    });
    contents = contents.replace(classBodyMatch[0], classBody);
  }

  contents = contents.replace(/\n{3,}/g, "\n\n");

  return contents;
}
