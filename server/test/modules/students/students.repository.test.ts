import type { Database } from '../../../src/database/connection';
import { PgStudentRepository } from '../../../src/modules/students/students.repository';

function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, ' ').trim();
}

let query: jest.Mock;
let repository: PgStudentRepository;

beforeEach(() => {
  query = jest.fn();
  repository = new PgStudentRepository({ query } as Database);
});

describe('PgStudentRepository', () => {
  test('insere um aluno com RA e nome nos parâmetros corretos', async () => {
    const student = { ra: 123, name: 'Ana' };
    query.mockResolvedValue({ rows: [student] });

    await expect(repository.create({ ra: 123, name: 'Ana' })).resolves.toEqual(student);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalizeSql(sql)).toBe('INSERT INTO students (ra, name) VALUES ($1, $2) RETURNING ra, name');
    expect(params).toEqual([123, 'Ana']);
  });

  test('lista alunos ordenados pelo nome no SQL', async () => {
    const students = [{ ra: 123, name: 'Ana' }, { ra: 456, name: 'Bruno' }];
    query.mockResolvedValue({ rows: students });

    await expect(repository.findAll()).resolves.toEqual(students);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]).toHaveLength(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe('SELECT ra, name FROM students ORDER BY name');
  });

  test('retorna lista vazia quando não existem alunos', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repository.findAll()).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
  });

  test('busca um aluno filtrando pelo RA', async () => {
    const student = { ra: 123, name: 'Ana' };
    query.mockResolvedValue({ rows: [student] });

    await expect(repository.findOne(123)).resolves.toEqual(student);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalizeSql(sql)).toBe('SELECT ra, name FROM students WHERE ra = $1');
    expect(params).toEqual([123]);
  });

  test('retorna undefined quando o aluno não existe', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repository.findOne(123)).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledTimes(1);
  });

  test('propaga a falha do banco na criação', async () => {
    const error = new Error('Falha no banco');
    query.mockRejectedValue(error);

    await expect(repository.create({ ra: 123, name: 'Ana' })).rejects.toBe(error);
  });

  test('propaga a falha do banco na listagem', async () => {
    const error = new Error('Falha no banco');
    query.mockRejectedValue(error);

    await expect(repository.findAll()).rejects.toBe(error);
  });

  test('propaga a falha do banco na busca', async () => {
    const error = new Error('Falha no banco');
    query.mockRejectedValue(error);

    await expect(repository.findOne(123)).rejects.toBe(error);
  });
});
