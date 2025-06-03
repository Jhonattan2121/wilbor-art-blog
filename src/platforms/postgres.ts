import { HAS_DATABASE, POSTGRES_SSL_ENABLED } from '@/app/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

// Criando o pool apenas se houver uma URL de banco de dados configurada
const pool = HAS_DATABASE 
  ? new Pool({
      connectionString: process.env.POSTGRES_URL,
      ...POSTGRES_SSL_ENABLED && { ssl: true },
    })
  : null;

export type Primitive = string | number | boolean | undefined | null;

export const query = async <T extends QueryResultRow = any>(
  queryString: string,
  values: Primitive[] = [],
) => {
  if (!pool) {
    if (queryString.toUpperCase().includes('COUNT(*)')) {
      return { 
        rows: [{ count: '0' } as unknown as T],
        command: '', 
        rowCount: 1, 
        oid: 0, 
        fields: [],
      } as QueryResult<T>;
    }
    return { 
      rows: [] as T[], 
      command: '', 
      rowCount: 0, 
      oid: 0, 
      fields: [],
    } as QueryResult<T>;
  }
  
  const client = await pool.connect();
  let response: QueryResult<T>;
  try {
    response = await client.query<T>(queryString, values);
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
  return response;
};

export const sql = <T extends QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: Primitive[]
) => {
  if (!isTemplateStringsArray(strings) || !Array.isArray(values)) {
    throw new Error('Invalid template literal argument');
  }

  let result = strings[0] ?? '';

  for (let i = 1; i < strings.length; i++) {
    result += `$${i}${strings[i] ?? ''}`;
  }

  return query<T>(result, values);
};

export const convertArrayToPostgresString = (
  array?: string[],
  type: 'braces' | 'brackets' | 'parentheses' = 'braces', 
) => array
  ? type === 'braces'
    ? `{${array.join(',')}}`
    : type === 'brackets'
      ? `[${array.map(i => `'${i}'`).join(',')}]`
      : `(${array.map(i => `'${i}'`).join(',')})`
  : null;

const isTemplateStringsArray = (
  strings: unknown,
): strings is TemplateStringsArray => {
  return (
    Array.isArray(strings) && 'raw' in strings && Array.isArray(strings.raw)
  );
};

export const testDatabaseConnection = async () =>
  query('SELECt COUNT(*) FROM pg_stat_user_tables');
