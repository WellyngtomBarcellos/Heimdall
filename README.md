<div align="center">
  <img src="https://ambarks.com/assets/image/ambarks/withe-logotipo.png" alt="Ambarks Studios Logo" height="80" style="margin-bottom: 20px" />
  <h1>Heimdall</h1>
  <p><strong>Transferência de Arquivos P2P Rápida, Segura e Sem Limites</strong></p>
  <p><i>Um projeto orgulhosamente desenvolvido e desenhado por <b>Ambarks Studios</b>.</i></p>
  <br />
</div>

## 📖 Sobre o Projeto

O **Heimdall** é uma solução leve e inteligente para quem precisa enviar arquivos diretamente para outra pessoa de forma instantânea. 

Criado como um projeto simples e ultra-eficiente pela equipe da **Ambarks Studios**, ele elimina totalmente a necessidade de fazer uploads demorados para servidores na nuvem. A transferência acontece "Ponto a Ponto" (P2P), ligando o seu navegador diretamente ao navegador do destinatário usando o máximo de banda da sua conexão com a internet.

### 🌟 Diferenciais
- 🚀 **Sem Intermediários:** Nada de subir o arquivo num Drive/WeTransfer só para a pessoa ter que baixar novamente. Vai direto!
- 🔒 **Privacidade Absoluta:** O tráfego não passa por bancos de dados. É tudo WebRTC criptografado e volátil.
- ♾️ **Arquivos Gigantes:** Quer enviar um projeto de 50GB? O limite é a sua própria internet e não as regras da plataforma.
- 📁 **Suporte a Pastas Inteligente:** Selecionou uma pasta? Ele cria um `.zip` inteiro na hora (direto na memória) e envia perfeitamente.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído usando o estado da arte do desenvolvimento web, aliando performance com uma Interface Premium:

* ⚛️ **[React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)**: Velocidade absurda de compilação e carregamento.
* 🎨 **[TailwindCSS](https://tailwindcss.com/)**: O motor responsável pelo visual super moderno, responsivo e estilização Glassmorphism / Dark Mode.
* 🌐 **[WebRTC (PeerJS)](https://peerjs.com/)**: A mágica por trás das negociações P2P e tráfego direto de dados sem servidor de mídia.
* 📦 **[client-zip](https://github.com/Touffy/client-zip)**: Geração de pacotes ZIP nativa via streaming direto no client-side.
* 🐳 **[Docker & NGINX](https://www.docker.com/)**: Deploy simplificado e infraestrutura pronta para produção na porta `8009`.

---

## 🚀 Como Subir o Projeto

### 🐳 Via Docker (Recomendado para Deploy)
A maneira mais estável e rápida de deixar a aplicação no ar, usando uma arquitetura multi-stage com NGINX.

```bash
docker-compose up -d --build
```
🌐 **Acesse em:** [http://localhost:8009](http://localhost:8009)

<br/>

### 💻 Rodando Local (Modo Desenvolvedor)
Se quiser fuçar no código ou rodar via Node.js localmente:

```bash
# 1. Instale todas as dependências
npm install

# 2. Inicie o Vite em modo de desenvolvimento
npm run dev
```
🌐 **Acesse em:** `http://localhost:8080` (A porta pode variar caso a 8080 esteja em uso).

---

## 🏢 Créditos & Direitos

<div align="center">
  <p>Este é um produto oficial da linha de utilitários da <strong>Ambarks Studios</strong>.</p>
  <a href="https://ambarks.com">
    <img src="https://img.shields.io/badge/Visite_nosso_site-Ambarks_Studios-0E1015?style=for-the-badge&logo=codeigniter&logoColor=3B6BEA" alt="Site Oficial" />
  </a>
  <br /><br />
  <p>&copy; 2026 Ambarks Studios&reg;. Todos os direitos reservados.</p>
</div>
