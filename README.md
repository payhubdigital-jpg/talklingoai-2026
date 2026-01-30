# 📱 TalkLingo AI - Tradutor de Voz em Tempo Real

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Gemini 2.5](https://img.shields.io/badge/Gemini-2.5_Native_Audio-blue)](https://ai.google.dev/)
[![Deploy to GitHub Pages](https://github.com/SEU_USUARIO/TalkLingo-AI/actions/workflows/deploy.yml/badge.svg)](https://github.com/SEU_USUARIO/TalkLingo-AI/actions/workflows/deploy.yml)

O **TalkLingo AI** é um ecossistema de tradução simultânea ultra-rápido, desenvolvido para quebrar barreiras linguísticas instantaneamente entre duas pessoas.

## 🚀 Como salvar no seu GitHub

Para enviar este código para o seu repositório, siga estes passos no seu terminal:

1. **Inicie o repositório local:**
   ```bash
   git init
   ```

2. **Adicione os arquivos:**
   ```bash
   git add .
   ```

3. **Crie o primeiro commit:**
   ```bash
   git commit -m "feat: initial commit with bidirectional interpreter and audio calibration"
   ```

4. **Conecte ao seu repositório remoto:**
   *(Substitua pela sua URL do GitHub)*
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
   ```

5. **Envie os arquivos:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

## 🔥 Diferenciais Competitivos

*   **🎙️ Interpretação Bidirecional Nativa:** Traduz automaticamente entre os dois idiomas selecionados sem precisar trocar manualmente quem fala.
*   **🗣️ Calibração de Áudio Profissional:** Constraints de `getUserMedia` otimizadas para redução de ruído e eco.
*   **🌍 Inteligência de Gênero:** A IA adapta a voz automaticamente para combinar com o falante.
*   **⚡ Baixa Latência:** Processamento via PCM 16-bit com buffers reduzidos para resposta quase instantânea.

## 🛠️ Configuração de Segurança

Para que o deploy automático funcione, vá em **Settings > Secrets and variables > Actions** no seu GitHub e adicione:
- `API_KEY`: Sua chave do Gemini API.

---
Desenvolvido por **TalkLingo Team** - *Construindo pontes entre culturas.*