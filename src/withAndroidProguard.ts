import {
  ConfigPlugin,
  withDangerousMod,
} from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';
import { AliyunPushPluginOptions } from './index';

const proguardRules = `
# Aliyun Push SDK ProGuard Rules
-keepclasseswithmembernames class ** {
    native <methods>;
}
-keepattributes Signature
-keep class sun.misc.Unsafe { *; }
-keep class com.taobao.** {*;}
-keep class com.alibaba.** {*;}
-keep class com.alipay.** {*;}
-keep class com.ut.** {*;}
-keep class com.ta.** {*;}
-keep class anet.**{*;}
-keep class anetwork.**{*;}
-keep class org.android.spdy.**{*;}
-keep class org.android.agoo.**{*;}
-keep class android.os.**{*;}
-keep class org.json.**{*;}
-dontwarn com.taobao.**
-dontwarn com.alibaba.**
-dontwarn com.alipay.**
-dontwarn anet.**
-dontwarn org.android.spdy.**
-dontwarn org.android.agoo.**
-dontwarn anetwork.**
-dontwarn com.ut.**
-dontwarn com.ta.**
`;

export const withAndroidProguard: ConfigPlugin<AliyunPushPluginOptions> = (
  config,
  _options
) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const proguardPath = path.join(
        projectRoot,
        'android',
        'app',
        'proguard-rules.pro'
      );

      try {
        let proguardContent = '';
        
        // 如果文件存在，读取现有内容
        if (fs.existsSync(proguardPath)) {
          proguardContent = fs.readFileSync(proguardPath, 'utf8');
        }

        // 检查是否已经包含阿里云推送的混淆规则
        if (!proguardContent.includes('# Aliyun Push SDK ProGuard Rules')) {
          // 添加混淆规则
          proguardContent += proguardRules;
          
          // 确保目录存在
          const dir = path.dirname(proguardPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          // 写入文件
          fs.writeFileSync(proguardPath, proguardContent);
        }
      } catch (error) {
        console.warn(
          `Failed to add Aliyun Push ProGuard rules to ${proguardPath}:`,
          error
        );
      }

      return config;
    },
  ]);
};
