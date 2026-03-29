# tests-unit 🌡️

Testes unitários para funções utilitárias de processamento de dados climáticos da [Open-Meteo API](https://open-meteo.com/).

![Unit Tests](https://github.com/seu-usuario/tests-unit/actions/workflows/unit-tests.yml/badge.svg)

---

## 🛠️ Stack

| Ferramenta | Versão | Função                   |
|------------|--------|--------------------------|
| TypeScript | ^5.4   | Tipagem estática         |
| Jest       | ^29.7  | Test runner + assertions |
| ts-jest    | ^29.1  | Compilação TS no Jest    |

---

## 📁 Estrutura

```
tests-unit/
├── src/
│   ├── weatherUtils.ts       # Funções utilitárias
│   └── weatherUtils.test.ts  # Testes unitários
├── jest.config.ts            # Coverage threshold: 90% linhas/funções
├── tsconfig.json
└── package.json
```

---

## 🧪 Funções testadas

| Função                  | O que faz                                          |
|-------------------------|----------------------------------------------------|
| `celsiusToFahrenheit()` | Converte °C → °F                                   |
| `fahrenheitToCelsius()` | Converte °F → °C (e testa inversibilidade)         |
| `classifyTemperature()` | Retorna label legível por humanos                  |
| `filterNulls()`         | Remove nulos de arrays genéricos                   |
| `calcAverage()`         | Média ignorando nulos, lança erro em array vazio   |
| `calcMax()` / `calcMin()`| Máximo/mínimo ignorando nulos                     |
| `filterHourlyByDate()`  | Filtra dados horários por data específica          |
| `buildDailySummary()`   | Constrói resumo diário com avgTemp, max, min, chuva|
| `isRainyDay()`          | Detecta dia chuvoso por probabilidade média        |

---

## 🎯 Técnicas demonstradas

- `it.each` para tabelas de casos parametrizados
- Fixtures reutilizáveis para dados mockados
- Testes de inversibilidade (`f(g(x)) === x`)
- Cobertura de edge cases: array vazio, todos nulos, índices fora de range
- Threshold de cobertura configurado no `jest.config.ts` (90%)

---

## 🚀 Como executar

```bash
npm install
npm test                # roda todos os testes
npm run test:coverage   # roda com relatório de cobertura
npm run test:watch      # modo interativo
```
