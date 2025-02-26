import { Camera } from '@/camera';
import { FujifilmSimulation } from '@/platforms/fujifilm';

export interface BaseMedia {
  id: string;
  url: string;
  title?: string;
  camera: Camera | null;
  simulation: FujifilmSimulation | null;
  createdAt: Date;
  updatedAt: Date;
  takenAt: Date;
  takenAtNaive: string;
  takenAtNaiveFormatted: string;
  aspectRatio: number;
  blurData: string;
  tags: string[];
  ipfsHash?: string | null;
}

export interface VideoMedia extends BaseMedia {
  type: 'video';
  extension: 'mp4' | 'webm' | 'mov';
  duration: number;
  thumbnailUrl: string;
}

export interface ImageMedia extends BaseMedia {
  type: 'image';
  extension: string;
}

export type Photo = VideoMedia | ImageMedia;

export interface Tag {
  tag: string;
  count: number;
}

export interface CameraWithCount {
  camera: Camera;
  cameraKey: string;
  count: number;
}

export interface SimulationWithCount {
  simulation: FujifilmSimulation;
  simulationKey: string;
  count: number;
}

export type Tags = Tag[];
export type Cameras = CameraWithCount[];
export type FilmSimulations = SimulationWithCount[];