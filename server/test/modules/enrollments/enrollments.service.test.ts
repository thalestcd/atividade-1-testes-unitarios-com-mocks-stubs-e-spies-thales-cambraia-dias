import { EnrollmentsService } from '../../../src/modules/enrollments/enrollments.service';
import type { EnrollmentRepository } from '../../../src/modules/enrollments/enrollments.repository';

const enrollment = { studentRa: 123, courseId: 1, enrolledAt: new Date('2026-01-10T12:00:00Z') };

let repository: jest.Mocked<EnrollmentRepository>;
let service: EnrollmentsService;

beforeEach(() => {
  repository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };
  service = new EnrollmentsService(repository);
});

describe('EnrollmentsService', () => {
  test('cria uma matrícula com RA e disciplina válidos', async () => {
    repository.create.mockResolvedValue(enrollment);

    await expect(service.create({ studentRa: 123, courseId: 1 })).resolves.toEqual(enrollment);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(123, 1);
  });

  test.each([
    { studentRa: 0, courseId: 1 },
    { studentRa: 123, courseId: 0 },
  ])('rejeita chave inválida na criação: %j', async (input) => {
    await expect(service.create(input)).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test('retorna 404 quando o aluno ou a disciplina não existe', async () => {
    repository.create.mockRejectedValue({ code: '23503' });

    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject({ statusCode: 404 });
    expect(repository.create).toHaveBeenCalledWith(123, 1);
  });

  test('retorna 409 para uma matrícula duplicada', async () => {
    repository.create.mockRejectedValue({ code: '23505' });

    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject({ statusCode: 409 });
    expect(repository.create).toHaveBeenCalledWith(123, 1);
  });

  test('retorna 404 ao buscar uma matrícula inexistente', async () => {
    repository.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(123, 1)).rejects.toMatchObject({ statusCode: 404 });
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123, 1);
  });

  test('propaga a falha inesperada de criação', async () => {
    const error = new Error('Falha no banco');
    repository.create.mockRejectedValue(error);

    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toBe(error);
  });

  test('lista as matrículas sem passar argumentos', async () => {
    const enrollments = [enrollment, { studentRa: 456, courseId: 2, enrolledAt: new Date('2026-02-10T12:00:00Z') }];
    repository.findAll.mockResolvedValue(enrollments);

    await expect(service.findAll()).resolves.toEqual(enrollments);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test('busca uma matrícula existente usando os dois identificadores', async () => {
    repository.findOne.mockResolvedValue(enrollment);

    await expect(service.findOne(123, 1)).resolves.toEqual(enrollment);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123, 1);
  });
});
