import type { Database } from '../../../src/database/connection';
import { PgEnrollmentRepository } from '../../../src/modules/enrollments/enrollments.repository';

function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, ' ').trim();
}

const enrollment = { studentRa: 123, courseId: 7, enrolledAt: new Date('2026-01-10T12:00:00Z') };
const columns = 'student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt"';

let query: jest.Mock;
let repository: PgEnrollmentRepository;

beforeEach(() => {
  query = jest.fn();
  repository = new PgEnrollmentRepository({ query } as Database);
});

describe('PgEnrollmentRepository', () => {
  test('insere matrícula e retorna os campos em camelCase', async () => {
    query.mockResolvedValue({ rows: [enrollment] });

    await expect(repository.create(123, 7)).resolves.toEqual(enrollment);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalizeSql(sql)).toBe(
      `INSERT INTO enrollments (student_ra, course_id) VALUES ($1, $2) RETURNING ${columns}`,
    );
    expect(params).toEqual([123, 7]);
    expect(enrollment.enrolledAt).toBeInstanceOf(Date);
  });

  test('lista matrículas com aliases e ordenação correta', async () => {
    const enrollments = [enrollment, { studentRa: 123, courseId: 8, enrolledAt: new Date('2026-02-10T12:00:00Z') }];
    query.mockResolvedValue({ rows: enrollments });

    await expect(repository.findAll()).resolves.toEqual(enrollments);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]).toHaveLength(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe(
      `SELECT ${columns} FROM enrollments ORDER BY student_ra, course_id`,
    );
  });

  test('retorna lista vazia quando não existem matrículas', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repository.findAll()).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
  });

  test('busca matrícula usando RA e ID da disciplina', async () => {
    query.mockResolvedValue({ rows: [enrollment] });

    await expect(repository.findOne(123, 7)).resolves.toEqual(enrollment);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalizeSql(sql)).toBe(
      `SELECT ${columns} FROM enrollments WHERE student_ra = $1 AND course_id = $2`,
    );
    expect(params).toEqual([123, 7]);
    expect(enrollment.enrolledAt).toEqual(new Date('2026-01-10T12:00:00Z'));
  });

  test('retorna undefined quando a matrícula não existe', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repository.findOne(123, 7)).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledTimes(1);
  });

  test('propaga a falha do banco na criação', async () => {
    const error = new Error('Falha no banco');
    query.mockRejectedValue(error);

    await expect(repository.create(123, 7)).rejects.toBe(error);
  });

  test('propaga a falha do banco na listagem', async () => {
    const error = new Error('Falha no banco');
    query.mockRejectedValue(error);

    await expect(repository.findAll()).rejects.toBe(error);
  });

  test('propaga a falha do banco na busca', async () => {
    const error = new Error('Falha no banco');
    query.mockRejectedValue(error);

    await expect(repository.findOne(123, 7)).rejects.toBe(error);
  });
});
