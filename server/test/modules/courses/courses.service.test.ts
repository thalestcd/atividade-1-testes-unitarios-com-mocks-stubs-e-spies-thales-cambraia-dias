import { CoursesService } from '../../../src/modules/courses/courses.service';
import type { CourseRepository } from '../../../src/modules/courses/courses.repository';

const course = { id: 123, name: 'Qualidade' };

let repository: jest.Mocked<CourseRepository>;
let service: CoursesService;

beforeEach(() => {
  repository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };
  service = new CoursesService(repository);
});

describe('CoursesService', () => {
  test('cria uma disciplina válida', async () => {
    repository.create.mockResolvedValue(course);

    await expect(service.create({ name: 'Qualidade' })).resolves.toEqual(course);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({ name: 'Qualidade' });
  });

  test.each([
    ['corpo nulo', null],
    ['objeto vazio', {}],
    ['nome curto', { name: 'A' }],
  ])('rejeita criação com %s', async (_description, input) => {
    await expect(service.create(input)).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test('retorna 409 quando o nome da disciplina já existe', async () => {
    repository.create.mockRejectedValue({ code: '23505' });

    await expect(service.create({ name: 'Qualidade' })).rejects.toMatchObject({ statusCode: 409 });
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  test('lista disciplinas usando uma resposta definida pelo stub', async () => {
    const courses = [course, { id: 124, name: 'Programação' }];
    repository.findAll.mockResolvedValue(courses);

    await expect(service.findAll()).resolves.toEqual(courses);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test('busca uma disciplina existente', async () => {
    repository.findOne.mockResolvedValue(course);

    await expect(service.findOne(123)).resolves.toEqual(course);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });

  test('retorna 404 quando a disciplina não existe', async () => {
    repository.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(123)).rejects.toMatchObject({ statusCode: 404 });
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });

  test('rejeita a busca com identificador zero', async () => {
    await expect(service.findOne(0)).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  test('propaga a falha inesperada ao criar', async () => {
    const error = new Error('Falha no banco');
    repository.create.mockRejectedValue(error);

    await expect(service.create({ name: 'Qualidade' })).rejects.toBe(error);
  });

  test('propaga a falha inesperada ao listar', async () => {
    const error = new Error('Falha no banco');
    repository.findAll.mockRejectedValue(error);

    await expect(service.findAll()).rejects.toBe(error);
  });

  test('propaga a falha inesperada ao buscar', async () => {
    const error = new Error('Falha no banco');
    repository.findOne.mockRejectedValue(error);

    await expect(service.findOne(123)).rejects.toBe(error);
  });

  test('observa a chamada de findOne usando spy', async () => {
    const stub: CourseRepository = {
      create: async () => course,
      findAll: async () => [course],
      findOne: async () => ({ id: 1, name: 'Qualidade' }),
    };
    const spy = jest.spyOn(stub, 'findOne');
    const stubService = new CoursesService(stub);

    await expect(stubService.findOne(1)).resolves.toEqual({ id: 1, name: 'Qualidade' });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
  });

  test('ignora campos extras ao encaminhar dados para criação', async () => {
    repository.create.mockResolvedValue(course);

    await expect(service.create({ name: 'Qualidade', extra: true })).resolves.toEqual(course);
    expect(repository.create).toHaveBeenCalledWith({ name: 'Qualidade' });
    expect(repository.create).toHaveBeenCalledTimes(1);
  });
});
