# Implementation Plan: AI 分镜生成器

## Overview

本实现计划采用前后端并行开发策略，先搭建基础架构，再逐步实现核心功能模块。前端使用 Next.js 16 + TypeScript + Tailwind CSS 4，后端使用 Go + Gin + GORM。

## Tasks

- [-] 1. 项目初始化与基础架构
  - [x] 1.1 初始化 Next.js 16 前端项目
    - 配置 TypeScript 5 严格模式
    - 配置 Tailwind CSS 4
    - 创建基础目录结构 (app, components, lib, hooks)
    - _Requirements: 11.1_

  - [ ] 1.2 初始化 Go 后端项目
    - 配置 Gin 框架和路由
    - 配置 GORM 和数据库连接
    - 创建基础目录结构 (handler, service, repository, model, pkg)
    - _Requirements: 11.1_

  - [ ] 1.3 创建通用 UI 组件库
    - 实现 Button, Input, Textarea, Select, Modal 等基础组件
    - 遵循 Dopamine 系统 UI 风格（深色侧边栏、浅色工作区、蓝色强调色）
    - _Requirements: 11.4_

- [ ] 2. 数据模型与存储服务
  - [ ] 2.1 实现后端数据模型
    - 创建 Character, Asset, Category, Tag, PromptConfig 模型
    - 配置 GORM 迁移
    - _Requirements: 3.1, 10.4_

  - [ ] 2.2 实现存储服务抽象层
    - 定义 Storage 接口
    - 实现 S3 兼容存储适配器
    - 实现本地文件存储适配器
    - _Requirements: 9.1, 9.2_

  - [ ]* 2.3 编写存储服务属性测试
    - **Property 10: 存储服务一致性**
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [x] 3. Gemini API 集成
  - [x] 3.1 实现 Gemini API 客户端
    - 创建 Gemini 客户端基础结构
    - 实现 2.5 Flash 文本分析接口
    - 实现 3 Pro Image 图像生成接口
    - 配置错误处理和重试机制
    - _Requirements: 2.1, 5.1_

  - [x] 3.2 实现角色解析服务
    - 解析 Gemini 返回的角色信息
    - 提取角色名称和描述
    - _Requirements: 2.2_

  - [ ]* 3.3 编写角色解析属性测试
    - **Property 3: 角色解析结构完整性**
    - **Validates: Requirements 2.2**

- [x] 4. Checkpoint - 基础架构验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 5. 前端布局与剧本输入
  - [x] 5.1 实现主页面布局
    - 创建左侧边栏 + 右侧工作区布局
    - 实现响应式适配
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 5.2 实现 ScriptInput 组件
    - 多行文本输入框
    - 实时状态同步
    - _Requirements: 1.1, 1.3_

  - [x] 5.3 实现 StyleSelector 组件
    - 风格选择下拉框
    - 自定义风格输入
    - _Requirements: 1.2_

  - [x] 5.4 实现空输入验证逻辑
    - 禁用按钮状态管理
    - 提示信息显示
    - _Requirements: 1.4_

  - [ ]* 5.5 编写输入验证属性测试
    - **Property 2: 空输入验证**
    - **Validates: Requirements 1.4**

- [x] 6. 角色管理功能
  - [x] 6.1 实现角色管理后端 API
    - POST /api/v1/storyboard/analyze (AI 角色识别)
    - CRUD /api/v1/characters
    - _Requirements: 2.1, 3.1, 3.2, 3.3_

  - [x] 6.2 实现 CharacterList 和 CharacterCard 组件
    - 角色列表展示
    - 添加/删除/编辑角色
    - 参考图占位符
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 6.3 实现角色参考图上传功能
    - 文件选择器
    - 上传进度显示
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 6.4 实现 AI 生成人设功能
    - 调用 Gemini 3 Pro Image
    - 生成进度显示
    - _Requirements: 4.3, 4.4_

  - [ ]* 6.5 编写角色列表 CRUD 属性测试
    - **Property 4: 角色列表 CRUD 操作**
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 7. Checkpoint - 角色管理验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 8. Canvas 图像处理
  - [x] 8.1 实现 Canvas 图像分割工具函数
    - splitToGrid9: 九宫格分割
    - splitToGrid4: 四宫格分割
    - canvasToBlob: 导出图像
    - _Requirements: 5.2, 6.3_

  - [ ]* 8.2 编写网格分割属性测试
    - **Property 6: 网格图像分割**
    - **Validates: Requirements 5.2, 6.3**

- [x] 9. 九宫格分镜生成
  - [x] 9.1 实现九宫格生成后端 API
    - POST /api/v1/storyboard/generate-grid9
    - 调用 Gemini 3 Pro Image
    - 存储生成的图像
    - _Requirements: 5.1, 9.1_

  - [x] 9.2 实现 GridNine 组件
    - 3x3 网格展示
    - 分镜选择交互
    - 加载状态显示
    - _Requirements: 5.3, 5.4, 6.1_

  - [ ]* 9.3 编写九宫格组件单元测试
    - 测试网格渲染
    - 测试选择交互
    - _Requirements: 5.3, 6.1_

- [ ] 10. 四宫格多角度生成
  - [x] 10.1 实现四宫格生成后端 API
    - POST /api/v1/storyboard/generate-grid4
    - 调用 Gemini 3 Pro Image
    - _Requirements: 6.2_

  - [x] 10.2 实现 GridFour 组件
    - 2x2 网格展示
    - 角度标注（远景、中景、近景、特写）
    - 角度选择交互
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ]* 10.3 编写四宫格角度标注属性测试
    - **Property 7: 四宫格角度标注完整性**
    - **Validates: Requirements 6.4**

- [-] 11. 高清重绘功能
  - [x] 11.1 实现高清重绘后端 API
    - POST /api/v1/storyboard/hd-redraw
    - 调用 Gemini 3 Pro Image
    - _Requirements: 7.2_

  - [ ] 11.2 实现 HDPreview 组件
    - 高清图像展示
    - 下载按钮
    - 保存到素材库按钮
    - _Requirements: 7.3, 7.4, 7.5_

- [ ] 12. Checkpoint - 分镜生成流程验证
  - 确保所有测试通过，如有问题请询问用户

- [-] 13. 提示词配置功能
  - [ ] 13.1 实现提示词配置后端 API
    - GET/PUT /api/v1/prompts
    - 持久化存储
    - _Requirements: 8.4_

  - [ ] 13.2 实现模板变量替换函数
    - 解析 {{变量名}} 格式
    - 替换变量值
    - _Requirements: 8.3_

  - [ ]* 13.3 编写模板变量替换属性测试
    - **Property 8: 提示词模板变量替换**
    - **Validates: Requirements 8.3**

  - [ ] 13.4 实现 PromptConfig 组件
    - 配置面板 UI
    - 三类提示词编辑器
    - 变量列表显示
    - 保存功能
    - _Requirements: 8.1, 8.2, 8.5_

  - [ ]* 13.5 编写提示词配置持久化属性测试
    - **Property 9: 提示词配置持久化**
    - **Validates: Requirements 8.4**

- [-] 14. 素材库功能
  - [x] 14.1 实现素材库后端 API
    - CRUD /api/v1/assets
    - CRUD /api/v1/categories
    - 分类筛选和标签搜索
    - _Requirements: 10.4, 10.5, 10.6, 10.8_

  - [x] 14.2 实现素材库页面
    - AssetGrid 素材网格
    - CategoryFilter 分类筛选
    - TagSearch 标签搜索
    - _Requirements: 10.5, 10.6_

  - [x] 14.3 实现 AssetCard 组件
    - 素材卡片展示
    - 详情查看
    - 编辑/删除操作
    - _Requirements: 10.7, 10.8_

  - [ ] 14.4 实现保存到素材库对话框
    - 分类选择/创建
    - 标签输入
    - 保存确认
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 14.5 编写素材库 CRUD 属性测试
    - **Property 12: 素材库 CRUD 和检索**
    - **Validates: Requirements 10.4, 10.5, 10.6, 10.8**

  - [ ]* 14.6 编写素材库标签功能属性测试
    - **Property 11: 素材库标签功能**
    - **Validates: Requirements 10.3**

- [-] 15. 响应式布局优化
  - [ ] 15.1 实现移动端适配
    - 侧边栏折叠
    - 工作区自适应
    - _Requirements: 11.5_

  - [ ]* 15.2 编写响应式布局属性测试
    - **Property 13: 响应式布局适配**
    - **Validates: Requirements 11.5**

- [x] 16. Final Checkpoint - 完整功能验证
  - 确保所有测试通过
  - 验证完整工作流程
  - 如有问题请询问用户

## Notes

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求条款以确保可追溯性
- Checkpoint 任务用于阶段性验证
- 属性测试验证核心正确性属性
- 单元测试覆盖具体示例和边界情况
