import { isUniqueViolation } from '../../src/database/unique-violation';

describe('Identificação de violação de unicidade', () => {
  test('identifica o código 23505 dentro do objeto', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
  });

  test.each([null, undefined, '23505', 23503, {}, { code: 'outro' }])(
    'não identifica o valor %s como violação de unicidade',
    (value) => {
      expect(isUniqueViolation(value)).toBe(false);
    },
  );
});
