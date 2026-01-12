# Requirements Document

## Introduction

AI 分镜生成器是一个基于 Google Gemini AI 的智能分镜创作工具，支持从剧本输入到高清分镜输出的完整工作流程。系统采用 Next.js 16 前端 + Go/Gin 后端架构，提供角色识别、九宫格分镜生成、多角度视图和高清重绘等核心功能。

## Glossary

- **Storyboard_Generator**: 分镜生成系统，负责协调所有 AI 生成和图像处理功能
- **Script_Parser**: 剧本解析器，使用 Gemini 2.5 Flash 提取角色信息
- **Character_Manager**: 角色管理模块，处理角色的增删改查和参考图管理
- **Image_Generator**: 图像生成器，使用 Gemini 3 Pro Image 生成分镜图像
- **Grid_Processor**: 网格处理器，使用 Canvas API 进行九宫格/四宫格图像分割
- **Prompt_Config**: 提示词配置模块，管理所有 AI 生成的提示词模板
- **Storage_Service**: 存储服务，支持 S3 兼容对象存储和本地存储
- **Asset_Library**: 素材库模块，管理分镜素材的分类、标签和检索

## Requirements

### Requirement 1: 剧本输入与风格设置

**User Story:** As a 创作者, I want 在侧边栏输入剧本内容并设置电影风格, so that 系统能够理解我的创作意图并生成匹配风格的分镜。

#### Acceptance Criteria

1. THE Storyboard_Generator SHALL 在侧边栏提供多行文本输入框用于剧本输入
2. THE Storyboard_Generator SHALL 提供电影风格选择或自定义输入功能
3. WHEN 用户输入剧本内容 THEN THE Storyboard_Generator SHALL 实时保存输入内容
4. IF 剧本内容为空 THEN THE Storyboard_Generator SHALL 禁用"AI 角色识别"按钮并显示提示

### Requirement 2: AI 角色识别

**User Story:** As a 创作者, I want 系统自动从剧本中提取角色信息, so that 我不需要手动逐个添加角色。

#### Acceptance Criteria

1. WHEN 用户点击"AI 角色识别"按钮 THEN THE Script_Parser SHALL 调用 Gemini 2.5 Flash API 分析剧本
2. WHEN AI 分析完成 THEN THE Script_Parser SHALL 返回角色列表，包含角色名称和描述
3. WHILE AI 正在分析 THEN THE Storyboard_Generator SHALL 显示加载状态
4. IF AI 分析失败 THEN THE Script_Parser SHALL 返回错误信息并允许用户重试

### Requirement 3: 角色管理

**User Story:** As a 创作者, I want 自由管理角色列表, so that 我可以根据需要调整角色设置。

#### Acceptance Criteria

1. THE Character_Manager SHALL 显示所有已识别或手动添加的角色列表
2. WHEN 用户点击"添加角色"按钮 THEN THE Character_Manager SHALL 创建新的空白角色条目
3. WHEN 用户点击角色的"删除"按钮 THEN THE Character_Manager SHALL 移除该角色
4. WHEN 用户编辑角色名称 THEN THE Character_Manager SHALL 实时更新角色信息
5. THE Character_Manager SHALL 为每个角色显示参考图占位符或已上传的图片

### Requirement 4: 角色参考图管理

**User Story:** As a 创作者, I want 为角色上传参考图或使用 AI 生成人设, so that 分镜生成时能保持角色一致性。

#### Acceptance Criteria

1. WHEN 用户点击角色的"上传图片"按钮 THEN THE Character_Manager SHALL 打开文件选择器
2. WHEN 用户选择图片文件 THEN THE Storage_Service SHALL 上传图片到对象存储并返回 URL
3. WHEN 用户点击"AI 生成人设"按钮 THEN THE Image_Generator SHALL 基于剧本和角色描述生成参考图
4. WHILE 图片上传或生成中 THEN THE Character_Manager SHALL 显示进度指示器
5. IF 上传或生成失败 THEN THE Character_Manager SHALL 显示错误提示并允许重试

### Requirement 5: 九宫格分镜生成

**User Story:** As a 创作者, I want 生成九宫格分镜预览, so that 我可以快速浏览多个分镜方案。

#### Acceptance Criteria

1. WHEN 用户点击"生成分镜"按钮 THEN THE Image_Generator SHALL 调用 Gemini 3 Pro Image 生成九宫格图像
2. WHEN 图像生成完成 THEN THE Grid_Processor SHALL 使用 Canvas API 将图像分割为 9 个独立分镜
3. THE Storyboard_Generator SHALL 在右侧工作区以 3x3 网格形式展示分镜
4. WHILE 分镜生成中 THEN THE Storyboard_Generator SHALL 显示生成进度
5. IF 生成失败 THEN THE Storyboard_Generator SHALL 显示错误信息并提供重试选项

### Requirement 6: 分镜选择与多角度生成

**User Story:** As a 创作者, I want 选择分镜后查看多角度视图, so that 我可以选择最佳的镜头角度。

#### Acceptance Criteria

1. WHEN 用户点击九宫格中的任意分镜 THEN THE Storyboard_Generator SHALL 高亮显示选中状态
2. WHEN 分镜被选中 THEN THE Image_Generator SHALL 自动生成四宫格多角度视图（远景、中景、近景、特写）
3. THE Grid_Processor SHALL 将四宫格图像分割为 4 个独立视图
4. THE Storyboard_Generator SHALL 清晰标注每个角度的类型
5. WHILE 多角度生成中 THEN THE Storyboard_Generator SHALL 显示加载状态

### Requirement 7: 高清重绘

**User Story:** As a 创作者, I want 对选定角度进行高清重绘, so that 我可以获得最终的高质量分镜图像。

#### Acceptance Criteria

1. WHEN 用户选择四宫格中的某个角度 THEN THE Storyboard_Generator SHALL 高亮显示选中状态
2. WHEN 角度被选中 THEN THE Image_Generator SHALL 自动进行高清重绘
3. THE Storyboard_Generator SHALL 在专门区域展示高清重绘结果
4. WHEN 重绘完成 THEN THE Storyboard_Generator SHALL 提供下载按钮
5. WHILE 重绘进行中 THEN THE Storyboard_Generator SHALL 显示处理进度

### Requirement 8: 提示词配置

**User Story:** As a 管理员, I want 自定义所有 AI 生成的提示词模板, so that 我可以优化生成效果。

#### Acceptance Criteria

1. WHEN 用户点击"提示词配置"按钮 THEN THE Prompt_Config SHALL 打开配置面板
2. THE Prompt_Config SHALL 提供九宫格分镜、多角度分镜、高清重绘三类提示词编辑器
3. THE Prompt_Config SHALL 支持 `{{变量名}}` 格式的占位符
4. WHEN 用户点击"保存配置" THEN THE Prompt_Config SHALL 持久化保存提示词配置
5. THE Prompt_Config SHALL 显示可用变量列表：`{{style}}`、`{{characters}}`、`{{script}}`、`{{cellIndex}}`、`{{mainCharacter}}`

### Requirement 9: 图像存储与管理

**User Story:** As a 创作者, I want 所有生成的图像被妥善存储, so that 我可以随时访问和下载。

#### Acceptance Criteria

1. WHEN 图像生成完成 THEN THE Storage_Service SHALL 将图像上传到配置的存储服务
2. THE Storage_Service SHALL 支持 S3 兼容对象存储和本地存储两种模式
3. THE Storage_Service SHALL 返回可访问的图像 URL
4. IF 存储失败 THEN THE Storage_Service SHALL 返回错误信息并触发重试机制

### Requirement 10: 素材库管理

**User Story:** As a 创作者, I want 将选定的分镜图保存到素材库并进行分类管理, so that 我可以方便地组织和复用分镜素材。

#### Acceptance Criteria

1. WHEN 用户在高清重绘结果上点击"保存到素材库"按钮 THEN THE Asset_Library SHALL 打开保存对话框
2. THE Asset_Library SHALL 提供分类选择功能，支持创建新分类
3. THE Asset_Library SHALL 提供 TAG 标签输入功能，支持多标签
4. WHEN 用户确认保存 THEN THE Asset_Library SHALL 将图像及元数据存储到数据库
5. THE Asset_Library SHALL 提供素材库浏览页面，支持按分类筛选
6. THE Asset_Library SHALL 支持按 TAG 标签搜索素材
7. WHEN 用户点击素材 THEN THE Asset_Library SHALL 显示素材详情（预览图、分类、标签、创建时间）
8. THE Asset_Library SHALL 支持素材的删除和编辑（修改分类、标签）

### Requirement 11: 用户界面布局

**User Story:** As a 创作者, I want 清晰的界面布局, so that 我可以高效地完成分镜创作流程。

#### Acceptance Criteria

1. THE Storyboard_Generator SHALL 采用左侧边栏 + 右侧工作区的布局
2. THE Storyboard_Generator SHALL 在侧边栏显示剧本输入、风格设置、角色管理功能
3. THE Storyboard_Generator SHALL 在工作区显示九宫格分镜、四宫格多角度、高清重绘结果
4. THE Storyboard_Generator SHALL 保持与现有 Dopamine 系统一致的 UI 风格（深色侧边栏、浅色工作区、蓝色强调色）
5. THE Storyboard_Generator SHALL 支持响应式布局，适配不同屏幕尺寸
6. THE Storyboard_Generator SHALL 在侧边栏提供"素材库"入口
