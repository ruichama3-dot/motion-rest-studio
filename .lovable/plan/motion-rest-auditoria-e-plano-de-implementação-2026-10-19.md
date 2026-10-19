# Motion Rest — Auditoria e Plano de Implementação

## 1. Auditoria do projeto atual

- O projeto está vazio: só tem a página inicial de exemplo. Não há nada a preservar.
- Base técnica fixa: React 19 + TypeScript, TanStack Start, Tailwind v4. Mantém-se.
- Sem backend ligado. Será ativado o Lovable Cloud (base de dados, autenticação, armazenamento, funções de servidor).

## 2. Avaliação dos repositórios

| Recurso | Licença | Decisão |
|---|---|---|
| Remotion | Licença própria: gratuita para indivíduos e empresas até 3 funcionários; empresas maiores precisam de licença paga | Usado como motor. `@remotion/player` para a pré-visualização no navegador (funciona já). |
| template-prompt-to-motion-graphics-saas | Template Remotion (Next.js). Gera código JS livre com IA | Reaproveitar padrões de validação e catálogo de animações. **Não** reaproveitar a execução de código gerado — usamos storyboard JSON validado + componentes aprovados (regra 5). |
| video-shotcraft | Skill de agente (receitas de planos, timing, transições) | Adaptar as receitas para presets dos nossos componentes Remotion (movimentos de câmara 2.5D, ritmo, cortes). Não é pacote npm. |
| Graphite | Apache-2.0, editor em Rust/WASM | Fora da v1. Sem vantagem clara agora. |

## 3. Restrições reais a conhecer (importante)

1. **Vercel:** o Lovable publica a app no seu próprio alojamento (com domínio próprio possível) e sincroniza com GitHub. A publicação no Vercel não é suportada a partir daqui; o código no GitHub pode ser publicado noutro lado por vocês, mas não será testado por mim.
2. **Renderização MP4:** o servidor da app não tem Chromium nem FFmpeg. O render real exige um serviço externo. Opção recomendada: **Remotion Lambda** (AWS) — precisa de uma conta AWS e chaves fornecidas por vocês. Alternativa: um servidor Node próprio (Railway/Render/Fly) com `@remotion/renderer`, chamado pela app. Sem isso, a exportação MP4 fica bloqueada e será indicada como tal — sem progresso simulado.
3. **IA (Gemini) e voz:** recomendo usar os modelos Gemini (texto e Gemini TTS) através da IA integrada do Lovable — sem chave para gerir, custos no saldo do workspace, chave só no servidor. Se preferirem a vossa própria chave Gemini ou ElevenLabs, também é possível.
4. **Português de Moçambique:** o Gemini TTS oferece português (pt-BR/pt-PT conforme as vozes disponíveis). Não existe variante pt-MZ; será testado e indicado com honestidade.

## 4. Fases

**Fase 1 — Fundação (implementada já após aprovação)**
- Design system branco/vermelho (tokens, tipografia, logótipo MOTION/REST com símbolo).
- Lovable Cloud: autenticação email/password, tabelas `projects`, `generations`, `render_jobs`, com RLS por utilizador; bucket privado para ficheiros.
- Layout com sidebar responsiva; Dashboard (projetos, estados vazios, criar/abrir/duplicar/eliminar reais).
- Biblioteca inicial de composições Remotion (Motion Typography, Tech Promo, Minimal Motion, Logo Reveal) com springs, máscaras, transições, 9:16 / 16:9 / 1:1.
- Pré-visualização real com `@remotion/player`.
- Testes: regras de validação do storyboard e limites (duração, cenas).

**Fase 2 — Geração:** briefing → Gemini → storyboard JSON (schema estrito, validação, até 2 correções) → composição.

**Fase 3 — Narração:** Gemini TTS por cena, duração real do áudio, ajuste dos tempos, amostra, regenerar, upload de voz própria, volumes, legendas por cena (timestamps por palavra só com alinhamento real).

**Fase 4 — Editor:** painel de propriedades ligado à composição, timeline com faixas, reordenar/duração, desfazer/refazer, auto-save.

**Fase 5 — Renderização:** depende do ponto 3.2 — tarefa, progresso real, ficheiro no armazenamento, link protegido, download.

**Fase 6 — Qualidade:** limites de uso, testes ponta-a-ponta, telemóvel, vídeo demo de 10 s.

## 5. Detalhes técnicos

- Storyboard: `{ format, fps, scenes: [{ template, durationInFrames, text, colors, motion, transition, narration }] }` validado com zod no servidor; só templates do catálogo.
- Funções de servidor TanStack (`createServerFn`) com autenticação; nenhuma chave no navegador.
- Remotion carregado só no cliente (Player é browser-only).
