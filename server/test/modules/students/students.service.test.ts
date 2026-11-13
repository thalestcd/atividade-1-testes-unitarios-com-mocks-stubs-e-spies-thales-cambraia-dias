import { StudentsService } from '../../../src/modules/students/students.service';
import type { StudentRepository } from '../../../src/modules/students/students.repository';

const student = { ra: 123, name: 'Ana' };

let repository: jest.Mocked<StudentRepository>;
let service: StudentsService;

beforeEach(() => {
  repository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };
  service = new StudentsService(repository);
});

describe('StudentsService', () => {
  test('cria um aluno com RA e nome válidos', async () => {
    repository.create.mockResolvedValue(student);

    await expect(service.create({ ra: 123, name: 'Ana' })).resolves.toEqual(student);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({ ra: 123, name: 'Ana' });
  });

  test('rejeita RA inválido sem chamar o repositório', async () => {
    await expect(service.create({ ra: 0, name: 'Ana' })).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test('retorna 409 quando o RA já está cadastrado', async () => {
    repository.create.mockRejectedValue({ code: '23505' });

    await expect(service.create({ ra: 123, name: 'Ana' })).rejects.toMatchObject({ statusCode: 409 });
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  test('retorna 404 quando não encontra o aluno', async () => {
    repository.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(123)).rejects.toMatchObject({ statusCode: 404 });
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });

  test('propaga o mesmo erro inesperado na criação', async () => {
    const error = new Error('Falha no banco');
    repository.create.mockRejectedValue(error);

    await expect(service.create({ ra: 123, name: 'Ana' })).rejects.toBe(error);
  });

  test('lista os alunos sem passar argumentos ao repositório', async () => {
    const students = [student, { ra: 456, name: 'Bruno' }];
    repository.findAll.mockResolvedValue(students);

    await expect(service.findAll()).resolves.toEqual(students);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test('busca um aluno existente pelo RA', async () => {
    repository.findOne.mockResolvedValue(student);

    await expect(service.findOne(123)).resolves.toEqual(student);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });
});
