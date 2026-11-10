# Controle Financeiro

App web instalável para acompanhar o dinheiro do mês: receitas, despesas, cartões de crédito, faturas, parcelas e limite.

- **Início**: a conta do mês (receitas − despesas − faturas = sobra ou falta), o que falta pagar e receber.
- **Carteira**: receitas e despesas fora do cartão, avulsas ou que repetem todo mês.
- **Cartões**: faturas, parcelas, limite disponível e categorias de cada fatura.
- **Análise**: gastos por categoria com orçamento, projeção dos próximos 12 meses e objetivos.

Funciona sem internet depois da primeira abertura. Os dados ficam só no aparelho (armazenamento do navegador) e nada é enviado para servidor. Use **Ajustes > Backup e planilhas > Salvar backup** de tempos em tempos.

## Instalar no iPhone

1. Abra o endereço do app no **Safari**.
2. Toque em Compartilhar e em **Adicionar à Tela de Início**.
3. Deixe "Abrir como Web App" ligado.

Atenção: no iPhone, apagar o ícone da tela de início apaga também os dados do app. Salve um backup antes.

## Desenvolver

O app publicado é um único `index.html` montado a partir de `src/`:

```
src/index.html     esqueleto da página
src/app.css        visual
src/js/*.js        código, concatenado em ordem alfabética
src/sw.js          service worker
src/version.txt    número da versão
```

Depois de editar, aumente o número em `src/version.txt` e rode:

```
python3 build.py              # gera index.html e sw.js
python3 tests/test_app.py     # testes no Chrome (pip install playwright)
```

Com internet, o app busca a página nova a cada abertura; sem internet, usa a cópia guardada.
