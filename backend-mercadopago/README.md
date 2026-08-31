# Checkout Mercado Pago — Caio Livio

Backend do biolink de vendas. O site (front) já está 100% pronto: monta o carrinho,
coleta os dados do comprador e chama este servidor. **Só falta plugar a conta do Mercado Pago.**

---

## Passo a passo (5 minutos)

### 1. Instalar e configurar

```bash
cd backend-mercadopago
cp .env.example .env      # no Windows: copy .env.example .env
npm install
```

Abra o `.env` e preencha o `MP_ACCESS_TOKEN` com o Access Token da conta do Caio
(painel do Mercado Pago → *Suas integrações* → *Credenciais de produção*).

```bash
npm start
```

Confira que subiu: `GET http://localhost:3000/saude` → `{ "ok": true, "obras": 51 }`

### 2. Apontar o site para o backend

No arquivo **`js/pagamento.js`** (na raiz do site), preencha:

```js
const PAGAMENTO = {
  endpoint: 'https://api.caiolivio.art/criar-preferencia',   // ← só isso
  ...
};
```

Pronto. Enquanto esse campo estiver vazio, o site **não quebra**: o botão
"Finalizar compra" cai automaticamente num pedido pelo WhatsApp com o resumo
do carrinho. Assim que o endpoint é preenchido, o Checkout Pro assume.

### 3. Webhook (baixa de estoque automática)

No painel do Mercado Pago, cadastre a URL de notificação:

```
https://api.caiolivio.art/webhook
```

Quando um pagamento é aprovado, o servidor marca as obras compradas como
`vendida: true` em `data/obras.js`. Elas continuam aparecendo no site com o selo
**VENDIDA** e o botão de compra desativado — cada obra é peça única.

> Se o backend rodar em outra máquina, sem acesso ao `data/obras.js` do site,
> troque a função `marcarVendida()` no `server.js` pela sua fonte de dados
> (banco, CMS, API do site).

---

## Contrato da API

### `POST /criar-preferencia`

Recebe:

```json
{
  "items": [
    { "id": "CL-101", "title": "Maré Alta (CL-101)", "quantity": 1,
      "unit_price": 3000, "currency_id": "BRL", "picture_url": "https://..." }
  ],
  "payer": { "name": "...", "email": "...", "phone": "5581..." },
  "shipping": { "gratis": true, "custo": 0 },
  "total": 3000,
  "origem": "biolink-caiolivio"
}
```

Responde:

```json
{ "init_point": "https://www.mercadopago.com.br/checkout/...", "id": "..." }
```

O front redireciona o comprador para o `init_point`.

**Segurança:** o `unit_price` que chega do navegador é **ignorado**. O servidor lê o
preço real em `data/obras.js` e recusa obras inexistentes (400) ou já vendidas (409).

### `POST /webhook`
Notificação do Mercado Pago. Responde 200 na hora e processa em seguida.

### `GET /saude`
Healthcheck.

---

## Regras de negócio já implementadas

| Regra | Onde |
|---|---|
| Cada obra é **peça única** (1 unidade, sem repetir no carrinho) | `js/loja.js` + `server.js` |
| **Frete grátis** para todo o Brasil (`shipments.cost = 0`) | `js/pagamento.js` + `server.js` |
| Preço padrão de **R$ 3.000** por obra | `PRECO_PADRAO` em `data/obras.js` |
| Parcelamento exibido em até 12x | `PAGAMENTO.parcelas` em `js/pagamento.js` |
| Obra vendida sai do estoque e ganha selo **VENDIDA** | `vendida: true` em `data/obras.js` |

## Onde mexer nos preços

Tudo em **`data/obras.js`**:

```js
const PRECO_PADRAO = 3000;   // muda o preço de todas de uma vez

const OBRAS = [
  { cod: 'CL-101', titulo: "Maré Alta", ..., preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-102', titulo: "Sopro",     ..., preco: 4500,         vendida: false },
  //                                            ↑ preço individual
];
```
