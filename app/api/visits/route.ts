import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'visits.json');

async function ensureDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readVisits() {
  await ensureDir();
  try {
    const data = await fs.readFile(dataFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    const initialData = { count: 0 };
    await fs.writeFile(dataFile, JSON.stringify(initialData));
    return initialData;
  }
}

async function writeVisits(count: number) {
  await ensureDir();
  await fs.writeFile(dataFile, JSON.stringify({ count }));
}

export async function GET() {
  try {
    const data = await readVisits();
    return NextResponse.json({ count: data.count });
  } catch (error: any) {
    console.error('Erro ao buscar visitas:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

export async function POST() {
  try {
    const data = await readVisits();
    const newCount = data.count + 1;
    await writeVisits(newCount);
    return NextResponse.json({ count: newCount });
  } catch (error: any) {
    console.error('Erro ao incrementar visitas:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}