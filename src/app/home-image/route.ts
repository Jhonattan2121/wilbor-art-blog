import { NextResponse } from 'next/server';
import { BASE_URL } from '../config';

export async function GET() {
  try {
    if (!BASE_URL) {
      throw new Error('BASE_URL não está configurada');
    }

    const baseUrl = new URL(BASE_URL).origin;
    const imageUrl = new URL('/home', baseUrl);

    return NextResponse.json({ 
      url: imageUrl.toString(),
      baseUrl: baseUrl 
    });
  } catch (error) {
    console.error('Erro na rota home-image:', error);
    return NextResponse.json({ 
      error: 'Configuração de URL inválida',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500 
    });
  }
}

export const dynamic = 'force-dynamic';