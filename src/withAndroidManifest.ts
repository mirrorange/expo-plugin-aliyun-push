import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest as withExpoAndroidManifest,
} from '@expo/config-plugins';
import { AliyunPushPluginOptions } from './index';

export const withAndroidManifest: ConfigPlugin<AliyunPushPluginOptions> = (
  config,
  options
) => {
  return withExpoAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    if (!manifest.manifest) {
      manifest.manifest = {} as any;
    }
    const manifestRoot = manifest.manifest as any;
    options = options ?? {};
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    // 添加权限（如果不存在）
    if (!manifestRoot.permission) {
      manifestRoot.permission = [];
    }

    const permissions = [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.WAKE_LOCK',
      'android.permission.VIBRATE',
    ];

    const permissionList = manifestRoot.permission as Array<any>;
    permissions.forEach((permission) => {
      if (!permissionList.some((p) => p.$['android:name'] === permission)) {
        permissionList.push({
          $: {
            'android:name': permission,
          },
        });
      }
    });

    // 添加 meta-data
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    const metaDataList = mainApplication['meta-data'];

    // 辅助函数：添加或更新 meta-data
    const addOrUpdateMetaData = (name: string, value: string | undefined) => {
      if (!value) return;

      const existingIndex = metaDataList.findIndex(
        (item) => item.$['android:name'] === name
      );

      const metaData = {
        $: {
          'android:name': name,
          'android:value': value,
        },
      };

      if (existingIndex >= 0) {
        metaDataList[existingIndex] = metaData;
      } else {
        metaDataList.push(metaData);
      }
    };

    // 添加厂商推送配置
      // 华为推送
      if (options.huawei?.appId) {
        addOrUpdateMetaData('com.huawei.hms.client.appid', `appid=${options.huawei.appId}`);
      }

      // VIVO 推送
      if (options.vivo) {
        addOrUpdateMetaData('com.vivo.push.api_key', options.vivo.apiKey);
        addOrUpdateMetaData('com.vivo.push.app_id', options.vivo.appId);
      }

      // 荣耀推送
      if (options.honor?.appId) {
        addOrUpdateMetaData('com.hihonor.push.app_id', options.honor.appId);
      }

      // OPPO 推送
      if (options.oppo) {
        addOrUpdateMetaData('com.oppo.push.key', options.oppo.key);
        addOrUpdateMetaData('com.oppo.push.secret', options.oppo.secret);
      }

      // 小米推送
      if (options.xiaomi) {
        addOrUpdateMetaData('com.xiaomi.push.id', options.xiaomi.appId);
        addOrUpdateMetaData('com.xiaomi.push.key', options.xiaomi.appKey);
      }

      // 魅族推送
      if (options.meizu) {
        addOrUpdateMetaData('com.meizu.push.id', options.meizu.appId);
        addOrUpdateMetaData('com.meizu.push.key', options.meizu.appKey);
      }

    // FCM 推送
    if (options.fcm) {
        addOrUpdateMetaData('com.gcm.push.sendid', options.fcm.senderId);
        addOrUpdateMetaData('com.gcm.push.applicationid', options.fcm.applicationId);
        addOrUpdateMetaData('com.gcm.push.projectid', options.fcm.projectId);
        addOrUpdateMetaData('com.gcm.push.api.key', options.fcm.apiKey);
      }

    // 添加阿里云推送消息接收器
    if (!mainApplication.receiver) {
      mainApplication.receiver = [];
    }

    const receiverName = 'com.aliyun.ams.push.AliyunPushMessageReceiver';
    const existingReceiver = mainApplication.receiver.find(
      (r) => r.$['android:name'] === receiverName
    );

    if (!existingReceiver) {
      mainApplication.receiver.push({
        $: {
          'android:name': receiverName,
          'android:exported': 'false',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'com.alibaba.push2.action.NOTIFICATION_OPENED',
                },
              },
            ],
          },
          {
            action: [
              {
                $: {
                  'android:name': 'com.alibaba.push2.action.NOTIFICATION_REMOVED',
                },
              },
            ],
          },
          {
            action: [
              {
                $: {
                  'android:name': 'com.alibaba.sdk.android.push.RECEIVE',
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
};
