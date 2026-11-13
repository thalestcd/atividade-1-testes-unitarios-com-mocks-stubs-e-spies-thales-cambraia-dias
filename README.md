# Atividade 1 — Testes unitários com mocks, stubs e spies

Aluno: Thales Cambraia Dias  
Curso: Desenvolvimento de Software Multiplataforma — FATEC  
Disciplina: Desenvolvimento Web III

## Sobre o projeto

A atividade consiste em testar uma API de cadastro de alunos, disciplinas e matrículas. Os testes verificam validações, serviços e repositórios usando mocks, stubs e spies, sem conectar ao banco de dados ou iniciar o servidor.

O projeto mantém a API em `server/`, a interface em `front/` e os scripts do banco em `database/`. Os nove arquivos de testes estão em `server/test/`. O enunciado e as orientações originais estão em [ENUNCIADO.md](ENUNCIADO.md).

## Tecnologias

TypeScript, Jest e ts-jest nos testes, além de Node.js, Express e PostgreSQL na aplicação. A interface usa HTML, CSS e JavaScript. O projeto também inclui configuração para Docker Compose.

## Como executar os testes

Com Node.js 24 ou superior e npm instalados, execute na pasta do projeto:

```bash
cd server
npm ci
npm test
```

Para verificar os tipos, compilar e gerar o relatório de cobertura:

```bash
npm run test:typecheck
npm run typecheck
npm run build
npm run test:coverage
```

Os testes unitários não precisam de PostgreSQL, Docker ou arquivo `.env`. O relatório de cobertura fica em `server/coverage/index.html`.
