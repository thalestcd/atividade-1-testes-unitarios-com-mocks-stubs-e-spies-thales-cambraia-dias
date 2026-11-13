import { HttpError } from '../src/errors';
import { positiveInteger, parseId, validateName, validateBody } from '../src/validation';

function expectBadRequest(action: () => unknown) {
  let caught: unknown;
  try {
    action();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(HttpError);
  expect(caught).toHaveProperty('statusCode', 400);
}

describe('Validação dos dados', () => {
  test.each([1, 2147483647])('positiveInteger aceita o número %s', (value) => {
    expect(positiveInteger(value, 'RA')).toBe(value);
  });

  test.each([0, -1, 1.5, NaN, Infinity, 2147483648, '123', null, undefined])(
    'positiveInteger rejeita %s',
    (value) => {
      expectBadRequest(() => positiveInteger(value, 'RA'));
    },
  );

  test.each([['1', 1], ['2147483647', 2147483647]])(
    'parseId converte %s para %i',
    (value, expected) => {
      expect(parseId(value, 'RA')).toBe(expected);
    },
  );

  test.each(['1abc', '1.2', '1e2', '', '-1', '0', '2147483648', 123])(
    'parseId rejeita %s',
    (value) => {
      expectBadRequest(() => parseId(value, 'RA'));
    },
  );

  test.each([
    ['Ana', 'Ana'],
    ['100 letras', 'a'.repeat(100)],
  ])('validateName aceita %s', (_description, name) => {
    expect(validateName(name)).toBe(name);
  });

  test.each(['', 'ab', '   ', ' a ', 'a'.repeat(101), 123, null, undefined])(
    'validateName rejeita %s',
    (value) => {
      expectBadRequest(() => validateName(value));
    },
  );

  test('validateBody aceita um objeto congelado sem modificá-lo', () => {
    const body = Object.freeze({ name: 'Ana' });
    expect(validateBody(body)).toBe(body);
    expect(body).toEqual({ name: 'Ana' });
  });

  test.each([null, undefined, [], 'Ana', 12])('validateBody rejeita %s', (value) => {
    expectBadRequest(() => validateBody(value));
  });

  test('validateBody mantém os campos extras e a referência original', () => {
    const body = { name: 'Ana', extra: true };
    expect(validateBody(body)).toBe(body);
    expect(body).toEqual({ name: 'Ana', extra: true });
  });
});
