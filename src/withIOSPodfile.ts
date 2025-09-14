import {
  ConfigPlugin,
  withDangerousMod,
} from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';
import { AliyunPushPluginOptions } from './index';

export const withIOSPodfile: ConfigPlugin<AliyunPushPluginOptions> = (
  config,
  _options
) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const podfilePath = path.join(projectRoot, 'ios', 'Podfile');

      try {
        if (fs.existsSync(podfilePath)) {
          let podfileContent = fs.readFileSync(podfilePath, 'utf8');

          // 添加阿里云仓库源（如果还没有）
          const aliyunSource = "source 'https://github.com/aliyun/aliyun-specs.git'";
          const cocoapodsSource = "source 'https://github.com/CocoaPods/Specs.git'";

          // 检查是否已经包含阿里云源
          if (!podfileContent.includes(aliyunSource)) {
            // 在文件开头添加源
            const sources = `${aliyunSource}\n${cocoapodsSource}\n\n`;
            
            // 如果文件已经有 CocoaPods 源，替换它；否则在开头添加
            if (podfileContent.includes(cocoapodsSource)) {
              podfileContent = podfileContent.replace(cocoapodsSource, sources);
            } else {
              // 在 require_relative 之后添加源
              const requirePattern = /require_relative[^\n]*\n/;
              const match = podfileContent.match(requirePattern);
              
              if (match) {
                const insertPosition = match.index! + match[0].length;
                podfileContent = 
                  podfileContent.slice(0, insertPosition) +
                  '\n' + sources +
                  podfileContent.slice(insertPosition);
              } else {
                // 如果没有 require_relative，在文件最开始添加
                podfileContent = sources + podfileContent;
              }
            }
          }

          // 写回文件
          fs.writeFileSync(podfilePath, podfileContent);
        }
      } catch (error) {
        console.warn(
          `Failed to modify Podfile at ${podfilePath}:`,
          error
        );
      }

      return config;
    },
  ]);
};
