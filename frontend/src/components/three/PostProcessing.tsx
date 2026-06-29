import React from 'react';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

/**
 * PostProcessing — 后期处理效果
 *
 * 包含：
 * - Bloom（辉光效果，增强星星和地球大气层）
 * - ACES Filmic Tone Mapping（电影级色彩映射）
 * - HDR 渲染
 */

const PostProcessing: React.FC = () => {
  return (
    <EffectComposer multisampling={8}>
      {/* Bloom Effect - 星星和地球辉光 */}
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        height={512}
        opacity={1.0}
        mipmapBlur
      />

      {/* ACES Filmic Tone Mapping - 电影级色调映射 */}
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
        resolution={256}
        whitePoint={4.0}
        middleGrey={0.6}
        minLuminance={0.01}
        averageLuminance={1.0}
        adaptationRate={1.0}
      />
    </EffectComposer>
  );
};

export default PostProcessing;
