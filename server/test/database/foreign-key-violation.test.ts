import { isForeignKeyViolation } from '../../src/database/foreign-key-violation';

describe('Identificação de violação de chave estrangeira', () => {
  test('identifica o código 23503 dentro do objeto', () => {
    expect(isForeignKeyViolation({ code: '23503' })).toBe(true);
  });

  test.each([null, undefined, '23505', 23503, {}, { code: 'outro' }])(
    'não identifica o valor %s como violação de chave estrangeira',
    (value) => {
      expect(isForeignKeyViolation(value)).toBe(false);
    },
  );
});
