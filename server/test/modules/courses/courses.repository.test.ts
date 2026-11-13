import type { Database } from '../../../src/database/connection';
import { PgCourseRepository } from '../../../src/modules/courses/courses.repository';

function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, ' ').trim();
}

let query: jest.Mock;
let repository: PgCourseRepository;

beforeEach(() => {
  query = jest.fn();
  repository = new PgCourseRepository({ query } as Database);
});

describe('PgCourseRepository', () => {
  test('insere uma disciplina usando SQL parametrizado', async () => {
    const course = { id: 7, name: 'Qualidade' };
    query.mockResolvedValue({ rows: [course] });

    await expect(repository.create({ name: 'Qualidade' })).resolves.toEqual(course);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalizeSql(sql)).toBe('INSERT INTO courses (name) VALUES ($1) RETURNING id, name');
    expect(params).toEqual(['Qualidade']);
  });

  test('lista as disciplinas selecionando as colunas e ordenando pelo ID', async () => {
    const courses = [{ id: 7, name: 'Qualidade' }, { id: 8, name: 'Testes' }];
    query.mockResolvedValue({ rows: courses });

    await expect(repository.findAll()).resolves.toEqual(courses);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]).toHaveLength(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe('SELECT id, name FROM courses ORDER BY id');
  });

  test('retorna lista vazia quando não existem disciplinas', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repository.findAll()).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
  });

  test('busca uma disciplina pelo ID usando parâmetro', async () => {
    const course = { id: 7, name: 'Qualidade' };
    query.mockResolvedValue({ rows: [course] });

    await expect(repository.findOne(7)).resolves.toEqual(course);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalizeSql(sql)).toBe('SELECT id, name FROM courses WHERE id = $1');
    expect(params).toEqual([7]);
  });

  test('retorna undefined quando a busca não encontra disciplina', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repository.findOne(7)).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledTimes(1);
  });

  test('propaga a falha do banco na criação', async () => {
    const error = new Error('Falha no banco');
    query.mockRejectedValue(error);

    await expect(repository.create({ name: 'Qualidade' })).rejects.toBe(error);
  });

  test('propaga a falha do banco na listagem', async () => {
    const error = new Error('Falha no banco');
    query.mockRejectedValue(error);

    await expect(repository.findAll()).rejects.toBe(error);
  });

  test('propaga a falha do banco na busca', async () => {
    const error = new Error('Falha no banco');
    query.mockRejectedValue(error);

    await expect(repository.findOne(7)).rejects.toBe(error);
  });
});
