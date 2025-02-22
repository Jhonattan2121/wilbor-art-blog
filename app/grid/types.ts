import { Camera } from '@/camera';
import { FujifilmSimulation } from '@/platforms/fujifilm';

export interface Photo {
  camera: Camera | null;
  simulation?: FujifilmSimulation | null;
  id: string;
  url: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  blurData: string;
  tags: string[];
  takenAt: Date;
  takenAtNaive: string;
  takenAtNaiveFormatted: string;
  extension: string;
  aspectRatio: number;
  ipfsHash?: string | null ;
}

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