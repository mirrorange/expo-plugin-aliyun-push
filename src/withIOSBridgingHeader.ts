import {
  ConfigPlugin,
  withDangerousMod,
  withXcodeProject,
} from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';
import { AliyunPushPluginOptions } from './index';

export const withIOSBridgingHeader: ConfigPlugin<AliyunPushPluginOptions> = (
  config,
  _options
) => {
  // 创建桥接头文件
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const projectName = config.modRequest.projectName || config.name;
      const iosPath = path.join(projectRoot, 'ios');
      const bridgingHeaderPath = path.join(
        iosPath,
        projectName,
        `${projectName}-Bridging-Header.h`
      );

      // 检查是否需要创建桥接头文件（检查是否有 Swift 文件）
      const hasSwiftFiles = checkForSwiftFiles(path.join(iosPath, projectName));

      if (hasSwiftFiles) {
        // 创建或更新桥接头文件
        let bridgingHeaderContent = '';
        
        if (fs.existsSync(bridgingHeaderPath)) {
          bridgingHeaderContent = fs.readFileSync(bridgingHeaderPath, 'utf8');
        }

        const importStatement = '#import <AliyunReactNativePush/AliyunReactNativePush.h>';
        
        if (!bridgingHeaderContent.includes(importStatement)) {
          bridgingHeaderContent += `\n${importStatement}\n`;
          fs.writeFileSync(bridgingHeaderPath, bridgingHeaderContent);
        }
      }

      return config;
    },
  ]);

  // 配置 Xcode 项目以使用桥接头文件
  config = withXcodeProject(config, (config) => {
    const projectName = config.modRequest.projectName || config.name;
    const bridgingHeaderPath = `${projectName}/${projectName}-Bridging-Header.h`;
    
    // 获取项目配置
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();

    // 为所有配置添加桥接头文件设置
    for (const key in configurations) {
      const configuration = configurations[key];
      if (
        configuration &&
        configuration.buildSettings &&
        typeof configuration.buildSettings === 'object' &&
        !Array.isArray(configuration.buildSettings)
      ) {
        // 只为应用目标添加（不是测试目标）
        if (configuration.name && (configuration.name === 'Debug' || configuration.name === 'Release')) {
          const hasSwiftFiles = checkForSwiftFiles(
            path.join(config.modRequest.projectRoot, 'ios', projectName)
          );
          
          if (hasSwiftFiles) {
            configuration.buildSettings['SWIFT_OBJC_BRIDGING_HEADER'] = bridgingHeaderPath;
            configuration.buildSettings['SWIFT_VERSION'] = configuration.buildSettings['SWIFT_VERSION'] || '5.0';
          }
        }
      }
    }

    return config;
  });

  return config;
};

// 检查目录中是否有 Swift 文件
function checkForSwiftFiles(directory: string): boolean {
  if (!fs.existsSync(directory)) {
    return false;
  }

  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 递归检查子目录
      if (checkForSwiftFiles(filePath)) {
        return true;
      }
    } else if (file.endsWith('.swift')) {
      return true;
    }
  }
  
  return false;
}
