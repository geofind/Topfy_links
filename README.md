# 🔥 Topfy Links

**Sistema automático de coleta, processamento e publicação de produtos afiliados**

Um projeto completo que integra **Python**, **GitHub Actions**, **Google Drive** e **Google Sites** para criar um pipeline de automação de afiliados escalável e modular.

---

## 🎯 Visão Geral

O Topfy Links é um sistema profissional que:

- **Coleta** produtos de múltiplas plataformas (Mercado Livre, Amazon)
- **Processa** dados com filtro de duplicados e enriquecimento
- **Publica** automaticamente em JSON no GitHub
- **Exibe** em dashboard web e Google Sites
- **Sincroniza** com Google Drive para backup e controle
- **Automatiza** execução diária via GitHub Actions

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Scheduler)               │
│                   Executa diariamente 12:00 UTC             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Python Bot (bot_produtos.py)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Mercado Livre│  │   Amazon     │  │  Shopee      │      │
│  │   (API)      │  │   (Mock)     │  │  (Future)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Product Manager (Processamento)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Duplicados │  │ Enriquecimento│ │ Validação  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────┼──────────┐
                ▼          ▼          ▼
            ┌────────┐ ┌────────┐ ┌────────┐
            │ GitHub │ │ Google │ │ Local  │
            │ (JSON) │ │ Drive  │ │ (data/)│
            └────────┘ └────────┘ └────────┘
                │          │
                ▼          ▼
            ┌────────────────────────┐
            │  Dashboard Web         │
            │  + Google Sites        │
            └────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
Topfy_links/
├── client/                      # Frontend React (Dashboard)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── components/
│   │   └── App.tsx
│   └── index.html
├── modules/                     # Módulos Python (Funções separadas)
│   ├── mercado_livre_affiliate.py
│   ├── amazon_affiliate.py
│   └── product_manager.py
├── scripts/                     # Scripts de automação
│   └── bot_produtos.py
├── data/                        # Dados (JSON)
│   ├── produtos.json
│   ├── publicados.json
│   └── relatorio_ultima_execucao.json
├── docs/                        # Documentação
│   ├── embed.html              # HTML para Google Sites
│   ├── GOOGLE_DRIVE_STRUCTURE.md
│   └── README.md
├── .github/workflows/           # GitHub Actions
│   ├── bot.yml                 # Automação diária
│   └── deploy.yml              # Deploy para GitHub Pages
├── requirements.txt             # Dependências Python
└── README.md                    # Este arquivo
```

---

## 🚀 Quick Start

### 1. Clonar o Repositório

```bash
git clone https://github.com/geofind/Topfy_links.git
cd Topfy_links
```

### 2. Instalar Dependências

```bash
# Python
pip install -r requirements.txt

# Node.js (para frontend)
pnpm install
```

### 3. Executar o Bot Localmente

```bash
cd scripts
python bot_produtos.py
```

### 4. Visualizar Resultados

Os produtos serão salvos em `data/produtos.json`:

```bash
cat data/produtos.json
```

---

## 📊 Módulos Python

### `mercado_livre_affiliate.py`

Gerencia integração com Mercado Livre:

```python
from modules.mercado_livre_affiliate import MercadoLivreAffiliate

affiliate = MercadoLivreAffiliate(tracking_id="topfylinks")
products = affiliate.search_products(query="smartphone", max_price=500)
```

**Métodos principais:**
- `search_products(query, max_price, limit)` - Busca produtos
- `generate_affiliate_link(product_url)` - Gera link com rastreamento
- `get_trending_products(limit)` - Obtém produtos em tendência

### `amazon_affiliate.py`

Gerencia integração com Amazon:

```python
from modules.amazon_affiliate import AmazonAffiliate

affiliate = AmazonAffiliate(affiliate_tag="topfylinks-20")
products = affiliate.get_mock_products()
```

**Métodos principais:**
- `generate_affiliate_link(product_asin)` - Gera link de afiliado
- `get_mock_products()` - Retorna produtos mock
- `search_products(query, max_price, limit)` - Busca (versão mock)

### `product_manager.py`

Gerencia processamento e duplicados:

```python
from modules.product_manager import ProductManager

manager = ProductManager(data_dir="data")
processed = manager.process_products(products, max_products=100)
stats = manager.get_stats()
```

**Métodos principais:**
- `process_products(products, max_products)` - Processa e filtra
- `filter_duplicates(products)` - Remove duplicados
- `enrich_products(products)` - Enriquece com descrições
- `get_latest_products(limit)` - Obtém últimos produtos
- `get_stats()` - Retorna estatísticas

---

## 🤖 GitHub Actions

### Automação Diária (`bot.yml`)

Executa automaticamente **todos os dias às 12:00 UTC** (09:00 Brasília):

```yaml
on:
  schedule:
    - cron: '0 12 * * *'  # Diariamente 12:00 UTC
  workflow_dispatch:      # Execução manual
```

**O que faz:**
1. ✅ Coleta produtos de múltiplas plataformas
2. ✅ Processa e filtra duplicados
3. ✅ Salva em `data/produtos.json`
4. ✅ Faz commit e push automático
5. ✅ Gera relatório de execução

### Deploy para GitHub Pages (`deploy.yml`)

Publica a página HTML automaticamente quando há mudanças em:
- `docs/embed.html`
- `data/produtos.json`

---

## 🌐 Integração com Google Sites

### Opção 1: Embed HTML Direto

1. Acesse seu Google Site
2. Clique em **Inserir** → **HTML**
3. Cole o código de `docs/embed.html`
4. Salve

### Opção 2: Embed via iFrame

```html
<iframe 
  src="https://geofind.github.io/Topfy_links/embed.html"
  width="100%"
  height="800"
  frameborder="0">
</iframe>
```

### Opção 3: Link Direto

Compartilhe o link:
```
https://geofind.github.io/Topfy_links/embed.html
```

---

## 📱 Dashboard Web

Acesse o dashboard em:
```
http://localhost:3000
```

**Funcionalidades:**
- 📊 Estatísticas em tempo real
- 🔄 Atualizar dados manualmente
- 🏷️ Filtrar por plataforma
- 💰 Visualizar preços
- 🔗 Links diretos para compra

---

## 💾 Google Drive

Estrutura sincronizada no Google Drive:

```
Topfy_Links/
├── dados/               (produtos.json, publicados.json)
├── scripts/             (módulos Python)
├── relatorios/          (relatórios diários)
└── documentacao/        (README, guias)
```

**IDs das Pastas:**
- Principal: `1b4jjt_zgqGhSrireXyY-YmjEfNh9gf8U`
- Dados: `1JGE1YOD-tbKuwkAGbc2ZvBYQfW4Wtcib`
- Scripts: `13BFsUvugfQGntMK9hSWz7Ln-ZwP59ydi`
- Relatórios: `1BF5Na24fKMZTQVHA5TvaIj3hbyaHZiB0`
- Documentação: `19csOromFh4RmQ31StE8n13x2j9spws_v`

### Sincronizar com Google Drive

```bash
# Usando rclone
rclone sync /home/ubuntu/Topfy_links/data manus_google_drive:Topfy_Links/dados

# Usando gws CLI
gws drive files create --upload data/produtos.json \
  --json '{"name": "produtos.json", "parents": ["1JGE1YOD-tbKuwkAGbc2ZvBYQfW4Wtcib"]}'
```

---

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env`:

```bash
# Mercado Livre
MERCADO_LIVRE_TRACKING_ID=topfylinks

# Amazon
AMAZON_AFFILIATE_TAG=topfylinks-20

# Configurações gerais
MAX_PRODUTOS=100
PRECO_MAX=300
DEBUG=false
```

### Configuração JSON

Edite `config.example.json` com suas credenciais:

```json
{
  "mercado_livre": {
    "tracking_id": "seu-tracking-id",
    "max_price": 300
  },
  "amazon": {
    "affiliate_tag": "seu-tag-20"
  }
}
```

---

## 📈 Fluxo de Dados

### 1. Coleta
```python
# Buscar produtos em múltiplas plataformas
ml_products = ml_affiliate.search_products("oferta", max_price=300)
amz_products = amz_affiliate.search_products("oferta", max_price=300)
```

### 2. Processamento
```python
# Filtrar duplicados
novos = manager.filter_duplicates(all_products)

# Enriquecer com descrições
enriquecidos = manager.enrich_products(novos)

# Salvar em JSON
manager.save_json("data/produtos.json", enriquecidos)
```

### 3. Publicação
```bash
# GitHub Actions faz commit automático
git add data/produtos.json
git commit -m "🤖 [AUTO] Atualização de produtos"
git push
```

### 4. Exibição
```javascript
// Frontend carrega do GitHub
fetch('https://raw.githubusercontent.com/geofind/Topfy_links/main/data/produtos.json')
  .then(res => res.json())
  .then(data => renderProducts(data))
```

---

## 🐛 Troubleshooting

### Erro: "Nenhum produto coletado"

**Causa:** API do Mercado Livre indisponível

**Solução:**
```bash
# Verificar conexão
curl https://api.mercadolibre.com/sites/MLB/search?q=teste

# Usar dados mock
python scripts/bot_produtos.py --mock
```

### Erro: "Falha ao fazer commit"

**Causa:** Permissões do GitHub

**Solução:**
```bash
# Verificar token
git config --global user.name "seu-usuario"
git config --global user.email "seu-email@github.com"

# Fazer push manualmente
git push origin main
```

### Erro: "Arquivo não encontrado no Google Drive"

**Causa:** ID da pasta incorreto

**Solução:**
```bash
# Listar pastas
gws drive files list --params '{"q": "name=\"Topfy_Links\""}'

# Atualizar IDs em GOOGLE_DRIVE_STRUCTURE.md
```

---

## 📚 Documentação Adicional

- [Google Drive Structure](docs/GOOGLE_DRIVE_STRUCTURE.md)
- [API Reference](docs/API_REFERENCE.md) *(em breve)*
- [Setup Guide](docs/SETUP.md) *(em breve)*

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

MIT License © 2026 - Topfy Links

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a [documentação](docs/)
2. Abra uma [issue no GitHub](https://github.com/geofind/Topfy_links/issues)
3. Consulte o [Troubleshooting](#-troubleshooting)

---

## 🎉 Próximos Passos

- [ ] Integração com Shopee
- [ ] Dashboard avançado com gráficos
- [ ] Suporte a múltiplos idiomas
- [ ] API REST para terceiros
- [ ] Bot Telegram/WhatsApp
- [ ] Painel de administração
- [ ] Testes automatizados
- [ ] CI/CD melhorado

---

**Desenvolvido com ❤️ por Topfy Links**

Última atualização: 2026-04-23
