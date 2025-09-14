import {
  ConfigPlugin,
  withProjectBuildGradle,
} from '@expo/config-plugins';
import { AliyunPushPluginOptions } from './index';

export const withAndroidGradle: ConfigPlugin<AliyunPushPluginOptions> = (
  config,
  _options
) => {
  return withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // 定义需要添加的仓库
    const repositories = [
      "maven { url 'https://maven.aliyun.com/nexus/content/repositories/releases/' }",
      "maven { url 'https://developer.huawei.com/repo/' }",
      "maven { url 'https://developer.hihonor.com/repo/' }"
    ];

    // 检查是否已包含阿里云和华为仓库
    let modifiedBuildGradle = buildGradle;
    let hasModified = false;

    repositories.forEach((repo) => {
      if (!modifiedBuildGradle.includes(repo)) {
        hasModified = true;
      }
    });

    if (hasModified) {
      // 在 allprojects.repositories 中添加仓库
      const allProjectsPattern = /allprojects\s*{[\s\S]*?repositories\s*{([\s\S]*?)}/;
      const match = modifiedBuildGradle.match(allProjectsPattern);

      if (match) {
        const repositoriesContent = match[1];
        let newRepositoriesContent = repositoriesContent;

        repositories.forEach((repo) => {
          if (!repositoriesContent.includes(repo)) {
            // 在 google() 后添加仓库
            if (repositoriesContent.includes('google()')) {
              newRepositoriesContent = newRepositoriesContent.replace(
                'google()',
                `google()\n        ${repo}`
              );
            } else {
              // 如果没有 google()，在末尾添加
              newRepositoriesContent = `${newRepositoriesContent}\n        ${repo}`;
            }
          }
        });

        modifiedBuildGradle = modifiedBuildGradle.replace(
          allProjectsPattern,
          `allprojects {\n    repositories {${newRepositoriesContent}}`
        );
      } else {
        // 如果没有找到 allprojects，在文件末尾添加
        const allProjectsBlock = `
allprojects {
    repositories {
        google()
        mavenCentral()
        ${repositories.join('\n        ')}
    }
}`;
        modifiedBuildGradle += allProjectsBlock;
      }
    }

    config.modResults.contents = modifiedBuildGradle;
    return config;
  });
};
