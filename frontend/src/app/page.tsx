'use client';

import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout';
import { ScriptInput, StyleSelector, CharacterList, GridNine, GridFour, HDPreview } from '@/components/storyboard';
import { useScriptValidation } from '@/hooks';
import { storyboardApi, characterApi } from '@/lib/api';
import { splitToGrid9, splitToGrid4 } from '@/lib/canvas';
import type { Character, AngleType } from '@/lib/types';
import type { AngleCell } from '@/components/storyboard/GridFour';

export default function Home() {
  const [script, setScript] = useState('');
  const [style, setStyle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Grid9 state
  const [grid9Image, setGrid9Image] = useState<string | null>(null);
  const [grid9Cells, setGrid9Cells] = useState<string[]>([]);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [isGeneratingGrid9, setIsGeneratingGrid9] = useState(false);

  // Grid4 state
  const [grid4Cells, setGrid4Cells] = useState<AngleCell[]>([]);
  const [selectedAngleIndex, setSelectedAngleIndex] = useState<number | null>(null);
  const [isGeneratingGrid4, setIsGeneratingGrid4] = useState(false);

  // HD Preview state
  const [hdImage, setHdImage] = useState<string | null>(null);
  const [hdAngle, setHdAngle] = useState<AngleType | null>(null);
  const [isGeneratingHD, setIsGeneratingHD] = useState(false);

  // 使用验证 Hook
  const validation = useScriptValidation(script);
  
  // 检查是否可以进行 AI 角色识别
  const canAnalyze = validation.canAnalyze;

  // 检查是否可以生成九宫格分镜
  const canGenerateGrid9 = script.trim().length > 0 && characters.length > 0;

  // AI 角色识别
  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await storyboardApi.analyze(script, style);
      
      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (response.data) {
        // 将 AI 识别的角色转换为 Character 格式
        const newCharacters: Character[] = response.data.characters.map((char, index) => ({
          id: `temp-${Date.now()}-${index}`,
          projectId: '',
          name: char.name,
          description: char.description,
        }));
        setCharacters(newCharacters);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 添加角色
  const handleAddCharacter = useCallback(() => {
    const newCharacter: Character = {
      id: `temp-${Date.now()}`,
      projectId: '',
      name: '新角色',
      description: '',
    };
    setCharacters(prev => [...prev, newCharacter]);
  }, []);

  // 更新角色
  const handleUpdateCharacter = useCallback((updatedCharacter: Character) => {
    setCharacters(prev =>
      prev.map(char =>
        char.id === updatedCharacter.id ? updatedCharacter : char
      )
    );
  }, []);

  // 删除角色
  const handleDeleteCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
  }, []);

  // 上传角色图片
  const handleUploadImage = useCallback(async (id: string, file: File) => {
    setUploadingIds(prev => new Set(prev).add(id));
    
    try {
      // 将文件转换为 base64 data URL
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setCharacters(prev =>
          prev.map(char =>
            char.id === id ? { ...char, referenceImage: dataUrl } : char
          )
        );
        setUploadingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      };
      reader.onerror = () => {
        setError('图片上传失败');
        setUploadingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
      setUploadingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  // AI 生成角色图片
  const handleGenerateImage = useCallback(async (id: string) => {
    const character = characters.find(c => c.id === id);
    if (!character) return;

    setGeneratingIds(prev => new Set(prev).add(id));
    setError(null);

    try {
      const response = await characterApi.generateImage(id, {
        script,
        characterName: character.name,
        characterDescription: character.description,
      });

      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (response.data) {
        setCharacters(prev =>
          prev.map(char =>
            char.id === id ? { ...char, referenceImage: response.data!.imageUrl } : char
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setGeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [characters, script]);

  // 生成九宫格分镜
  const handleGenerateGrid9 = useCallback(async () => {
    if (!canGenerateGrid9) return;

    setIsGeneratingGrid9(true);
    setError(null);
    setSelectedCellIndex(null);

    try {
      const response = await storyboardApi.generateGrid9({
        script,
        style,
        characters: characters.map(c => ({
          name: c.name,
          referenceImage: c.referenceImage,
        })),
      });

      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (response.data) {
        const imageUrl = response.data.imageUrl;
        setGrid9Image(imageUrl);

        // Split the image into 9 cells using Canvas API
        try {
          const cells = await splitToGrid9(imageUrl);
          setGrid9Cells(cells);
        } catch (splitErr) {
          setError('图像分割失败，请重试');
          console.error('Split error:', splitErr);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成分镜失败');
    } finally {
      setIsGeneratingGrid9(false);
    }
  }, [canGenerateGrid9, script, style, characters]);

  // 选择分镜格子
  const handleSelectCell = useCallback(async (index: number) => {
    setSelectedCellIndex(index);
    
    // Reset Grid4 and HD states
    setGrid4Cells([]);
    setSelectedAngleIndex(null);
    setHdImage(null);
    setHdAngle(null);

    // Get the selected cell image
    const cellImage = grid9Cells[index];
    if (!cellImage) return;

    // Generate Grid4 multi-angle view
    setIsGeneratingGrid4(true);
    setError(null);

    try {
      const mainCharacter = characters.length > 0 ? characters[0].name : '';
      const response = await storyboardApi.generateGrid4({
        sourceImage: cellImage,
        cellIndex: index,
        mainCharacter,
      });

      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (response.data) {
        const imageUrl = response.data.imageUrl;

        // Split the image into 4 cells using Canvas API
        try {
          const cells = await splitToGrid4(imageUrl);
          const angleTypes: AngleType[] = ['wide', 'medium', 'close', 'extreme'];
          const angleLabels = ['远景', '中景', '近景', '特写'];
          
          const angleCells: AngleCell[] = cells.map((url, i) => ({
            url,
            angle: angleTypes[i],
            label: angleLabels[i],
          }));
          
          setGrid4Cells(angleCells);
        } catch (splitErr) {
          setError('图像分割失败，请重试');
          console.error('Split error:', splitErr);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成多角度视图失败');
    } finally {
      setIsGeneratingGrid4(false);
    }
  }, [grid9Cells, characters]);

  // 选择角度并触发高清重绘
  const handleSelectAngle = useCallback(async (index: number) => {
    setSelectedAngleIndex(index);
    
    // Reset HD state
    setHdImage(null);
    setHdAngle(null);

    // Get the selected angle cell
    const angleCell = grid4Cells[index];
    if (!angleCell) return;

    // Perform HD redraw
    setIsGeneratingHD(true);
    setError(null);

    try {
      const response = await storyboardApi.hdRedraw({
        sourceImage: angleCell.url,
        angle: angleCell.angle,
      });

      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (response.data) {
        setHdImage(response.data.imageUrl);
        setHdAngle(angleCell.angle);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '高清重绘失败');
    } finally {
      setIsGeneratingHD(false);
    }
  }, [grid4Cells]);

  // 保存到素材库
  const handleSaveToLibrary = useCallback((imageUrl: string, angle: AngleType) => {
    // TODO: Implement save to asset library dialog
    console.log('Save to library:', { imageUrl, angle });
    alert('素材库功能即将上线');
  }, []);

  // 下载高清图像
  const handleDownloadHD = useCallback((imageUrl: string, angle: AngleType) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `storyboard-hd-${angle}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 侧边栏内容
  const sidebarContent = (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="p-3 rounded-lg bg-[#f38ba8]/20 text-[#f38ba8] text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            关闭
          </button>
        </div>
      )}

      {/* 剧本输入区域 */}
      <section>
        <h2 className="text-sm font-medium text-[#a6adc8] uppercase tracking-wider mb-3">
          剧本输入
        </h2>
        <ScriptInput
          value={script}
          onChange={setScript}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          disabled={!canAnalyze}
          validationMessage={validation.errorMessage}
        />
      </section>

      {/* 风格设置区域 */}
      <section>
        <h2 className="text-sm font-medium text-[#a6adc8] uppercase tracking-wider mb-3">
          电影风格
        </h2>
        <StyleSelector value={style} onChange={setStyle} />
      </section>

      {/* 角色管理区域 */}
      <section>
        <h2 className="text-sm font-medium text-[#a6adc8] uppercase tracking-wider mb-3">
          角色管理
        </h2>
        <CharacterList
          characters={characters}
          onAdd={handleAddCharacter}
          onUpdate={handleUpdateCharacter}
          onDelete={handleDeleteCharacter}
          onUploadImage={handleUploadImage}
          onGenerateImage={handleGenerateImage}
          generatingIds={generatingIds}
          uploadingIds={uploadingIds}
          isAnalyzing={isAnalyzing}
        />
      </section>
    </div>
  );


  // 工作区内容
  const workspaceContent = (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto">
      {/* 工作区标题 */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          分镜工作区
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          在左侧输入剧本，生成的分镜将在此处展示
        </p>
      </div>

      {/* 九宫格分镜展示区域 */}
      <div>
        <GridNine
          imageUrl={grid9Image}
          cells={grid9Cells}
          selectedIndex={selectedCellIndex}
          onSelect={handleSelectCell}
          isLoading={isGeneratingGrid9}
          onGenerate={handleGenerateGrid9}
          canGenerate={canGenerateGrid9}
        />
      </div>

      {/* 四宫格多角度视图 - 当选择了九宫格中的分镜后显示 */}
      {(selectedCellIndex !== null || isGeneratingGrid4 || grid4Cells.length > 0) && (
        <div>
          <GridFour
            cells={grid4Cells}
            selectedIndex={selectedAngleIndex}
            onSelect={handleSelectAngle}
            isLoading={isGeneratingGrid4}
          />
        </div>
      )}

      {/* 高清重绘结果 - 当选择了角度后显示 */}
      {(selectedAngleIndex !== null || isGeneratingHD || hdImage) && (
        <div>
          <HDPreview
            imageUrl={hdImage}
            angle={hdAngle}
            isLoading={isGeneratingHD}
            onSaveToLibrary={handleSaveToLibrary}
            onDownload={handleDownloadHD}
          />
        </div>
      )}
    </div>
  );

  return (
    <MainLayout
      sidebarContent={sidebarContent}
      workspaceContent={workspaceContent}
    />
  );
}
