# Especificação - Document Management System

> Modelo de especificação (spec) para orientar o desenvolvimento guiado por
> especificação (Spec Driven Development). Preencha cada seção com o apoio do
> Plan Mode do GitHub Copilot durante o Passo 1.

## 1. Objetivo

Descreva em uma frase o que o sistema deve entregar.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos
- Download de documentos
- Gestão simples por usuário

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Persistência de contas e sessões entre reinícios do backend

## 3. Requisitos funcionais

| ID    | Requisito                                            |
| ----- | ---------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento                   |
| RF-02 | O usuário pode listar os documentos enviados         |
| RF-03 | O usuário pode baixar um documento pelo identificador|
| RF-04 | O usuário pode criar uma conta local e fazer login    |
| RF-05 | O acesso aos documentos exige uma sessão autenticada |

## 4. Requisitos não funcionais

| ID     | Requisito                                                   |
| ------ | ----------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local via multer            |
| RNF-02 | Metadados mantidos em memória nesta fase                    |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor)          |
| RNF-04 | Sessões em cookie HttpOnly, SameSite=Strict, com expiração   |
| RNF-05 | Senhas armazenadas como hashes scrypt com salt aleatório    |
| RNF-06 | Limite de 10 tentativas por IP e rota em 15 minutos          |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                          |
| ------------ | ------ | ---------------------------------- |
| id           | string | Identificador único do documento   |
| originalName | string | Nome original do arquivo enviado   |
| size         | number | Tamanho em bytes                   |
| uploadedAt   | string | Data/hora do upload (ISO 8601)     |
| owner        | string | Identificador do usuário dono      |

## 6. Contratos de API

### POST /upload

- Entrada: arquivo (multipart/form-data)
- Autenticação: sessão local obrigatória
- Saída: metadados do documento criado

### GET /documents

- Autenticação: sessão local obrigatória
- Saída: lista de metadados de documentos

### GET /documents/:id/download

- Autenticação: sessão local obrigatória e titularidade do documento
- Saída: conteúdo binário do arquivo

### POST /auth/register e POST /auth/login

- Entrada: `{ "username": "...", "password": "..." }`
- Saída: usuário autenticado e cookie de sessão HttpOnly
- Cadastro aberto; usuário com 3–32 caracteres (`a-z`, `0-9`, `.`, `_`, `-`)
- Senha com 12–128 caracteres

### GET /auth/me e POST /auth/logout

- `GET /auth/me`: retorna o usuário da sessão atual ou `401`
- `POST /auth/logout`: invalida a sessão e remove o cookie

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples (routes, controllers, services, repositories)
- Frontend baseado em componentes (React)
- Armazenamento local apenas
- Contas, sessões e metadados são mantidos em memória; reiniciar o backend os apaga
- A identidade do dono é derivada da sessão validada no backend, nunca de um header controlado pelo cliente

## 8. Plano de execução

Liste as etapas na ordem de implementação (gerado no Passo 1).

1. ...
2. ...
3. ...
