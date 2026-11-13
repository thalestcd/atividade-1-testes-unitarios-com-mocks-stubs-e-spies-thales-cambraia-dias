# Atividade 1 — Testes unitários com mocks, stubs e spies

Aluno: Thales Cambraia Dias  
Curso: Desenvolvimento de Software Multiplataforma — FATEC  
Disciplina: Desenvolvimento Web III

## Sobre o projeto

A atividade consiste em testar uma API de cadastro de alunos, disciplinas e matrículas. Os testes verificam validações, serviços e repositórios usando mocks, stubs e spies, sem conectar ao banco de dados ou iniciar o servidor.

O projeto mantém a API em `server/`, a interface em `front/` e os scripts do banco em `database/`. O enunciado e as orientações originais estão em [ENUNCIADO.md](ENUNCIADO.md).

## Tecnologias

TypeScript, Jest e ts-jest nos testes, além de Node.js, Express e PostgreSQL na aplicação. A interface usa HTML, CSS e JavaScript. O projeto também inclui configuração para Docker Compose.

## Organização dos testes

Os nove arquivos ficam em `server/test/`:

| Arquivo | Casos | O que é testado |
| --- | ---: | --- |
| `validation.test.ts` | 38 | Números, identificadores, nomes e corpo da requisição, incluindo limites e entradas inválidas. |
| `database/unique-violation.test.ts` | 7 | Reconhecimento do código de duplicidade `23505`. |
| `database/foreign-key-violation.test.ts` | 7 | Reconhecimento do código de chave estrangeira `23503`. |
| `modules/courses/courses.service.test.ts` | 14 | Criação, listagem, busca, erros e uso de mocks, stubs e spies. |
| `modules/students/students.service.test.ts` | 7 | Cadastro, listagem e busca de alunos, RA inválido, duplicidade e falha inesperada. |
| `modules/enrollments/enrollments.service.test.ts` | 9 | Cadastro e consulta de matrículas, chaves inválidas, referências inexistentes e duplicidade. |
| `modules/courses/courses.repository.test.ts` | 8 | SQL, parâmetros, retornos e falhas nas operações de disciplinas. |
| `modules/students/students.repository.test.ts` | 8 | SQL, parâmetros, retornos e falhas nas operações de alunos. |
| `modules/enrollments/enrollments.repository.test.ts` | 8 | SQL, parâmetros, campos em camelCase, data e falhas nas operações de matrículas. |
| **Total** | **106** | As entradas de `test.each` são contadas separadamente. |

## Mocks, stubs e spies

| Dublê | Uso no projeto |
| --- | --- |
| Stub | Define respostas conhecidas com `mockResolvedValue`, como uma lista de disciplinas. |
| Mock | Usa `jest.fn()` para simular métodos e conferir argumentos, quantidade de chamadas e chamadas que não deveriam acontecer. |
| Spy | Usa `jest.spyOn` no método `findOne` de um objeto existente, mantendo sua implementação e observando a chamada. |

Nos serviços, o repositório é substituído por um dublê. Nos testes de repositório, `Database.query` é simulado e retorna objetos no formato `{ rows: [...] }`. O SQL é comparado após normalizar espaços e quebras de linha, e os valores são conferidos separadamente no array de parâmetros.

Os testes também verificam os erros com `statusCode` 400, 404 e 409 e a propagação da mesma instância de erros inesperados. Esses códigos são propriedades dos erros dos serviços; não são respostas de requisições HTTP nesses testes.

Cada teste recebe novos mocks no `beforeEach`. A configuração do Jest limpa o histórico das chamadas e restaura os spies. Os testes de matrículas usam datas fixas.

## Como executar

Use Node.js 24, conforme o enunciado, e npm. Para baixar o projeto:

```bash
git clone https://github.com/thalestcd/atividade-1-testes-unitarios-com-mocks-stubs-e-spies-thales-cambraia-dias.git
cd atividade-1-testes-unitarios-com-mocks-stubs-e-spies-thales-cambraia-dias
```

Depois, instale as dependências e execute os testes:

```bash
cd server
npm ci
npm test
```

Outros comandos disponíveis, sempre dentro de `server/`:

| Comando | Finalidade |
| --- | --- |
| `npm run test:verbose` | Mostrar o nome e o resultado de cada caso de teste. |
| `npm run test:typecheck` | Verificar os tipos do código e dos testes. |
| `npm run typecheck` | Verificar os tipos do código de produção. |
| `npm run build` | Compilar a API em `server/dist/`. |
| `npm run test:coverage` | Executar os testes e gerar o relatório de cobertura. |

Os testes unitários não precisam de PostgreSQL, Docker ou arquivo `.env`. O relatório de cobertura fica em `server/coverage/index.html`.

## Resultados da verificação

Na verificação de 13/11/2026, usando Node.js 26.13.0:

```text
Test Suites: 9 passed, 9 total
Tests:       106 passed, 106 total
```

A checagem de tipos e a compilação passaram sem erros. Não foi necessário alterar o código de produção ou as configurações fornecidas.

As validações, os identificadores de erros do banco, os serviços, os repositórios e `errors.ts` tiveram 100% de cobertura de instruções, ramificações, funções e linhas. A cobertura geral de linhas foi de 57,45%, pois o relatório também inclui `app.ts` e as rotas, que não são exercitados nesta atividade. O enunciado não exige um percentual mínimo.

## Escopo da atividade

Os testes verificam as unidades usando respostas simuladas. Eles não executam o SQL em um PostgreSQL real. Testes de rotas HTTP, montagem do Express, frontend e integração com o banco ficam fora desta entrega.

Para executar a aplicação completa com Docker Compose, consulte as instruções em [ENUNCIADO.md](ENUNCIADO.md). Essa execução é separada dos testes unitários e não foi validada nesta revisão.

O arquivo `.env.example` serve como modelo para a configuração local. O `.gitignore` mantém `.env`, dependências, arquivos temporários, compilação e relatórios de cobertura fora do repositório.
