# Motion Rest Studio

MOTION REST — PROMPT MASTER DE DESENVOLVIMENTO



1. IDENTIDADE DO PROJETO



Desenvolve uma plataforma profissional chamada MOTION REST, uma aplicação SaaS de criação de vídeos através de inteligência artificial, especializada em motion graphics cinematográficos, vídeos publicitários, animações avançadas, narração profissional e edição visual.



A plataforma deve transformar uma descrição escrita pelo utilizador num vídeo estruturado, animado, narrado, sincronizado e exportável em MP4.



Objetivo principal: criar uma ferramenta de produção audiovisual com qualidade profissional, e não apenas uma interface demonstrativa.



O projeto será desenvolvido através do Lovable, sincronizado com GitHub e publicado no Vercel, utilizando um backend compatível com renderização de vídeo.



Antes de implementar, analisa o projeto existente, identifica as funcionalidades já disponíveis e preserva tudo o que estiver a funcionar.



---



2. IDENTIDADE VISUAL



Cria uma interface premium com uma identidade própria, moderna, minimalista e tecnológica.



Paleta de cores:



- Branco: #FFFFFF

- Vermelho principal: #E52535

- Vermelho escuro: #A91120

- Preto suave: #171717

- Cinzento claro: #F5F5F7

- Cinzento secundário: #777777



Direção de design:



- Interface clara, com bastante espaço em branco.

- Vermelho usado estrategicamente nos botões principais, indicadores, detalhes e ações importantes.

- Efeito vidro subtil, inspirado em interfaces premium, sem prejudicar a legibilidade.

- Cantos arredondados, sombras suaves e bordas delicadas.

- Animações discretas na interface.

- Tipografia profissional, hierarquia visual consistente e ícones modernos.

- Sidebar elegante e responsiva.

- Excelente experiência em telemóveis Android, tablets e computadores.

- Tema claro como padrão.

- Nada de excesso de gradientes, elementos decorativos ou cartões desnecessários.



A interface deve parecer um produto SaaS comercial de alto nível, não um template genérico criado automaticamente.



Nome: Motion Rest.



Logótipo: criar uma identidade tipográfica simples e marcante, com a palavra MOTION em preto e REST em vermelho, acompanhada de um símbolo minimalista inspirado em movimento e reprodução de vídeo.



---



3. REPOSITÓRIOS E RECURSOS A ANALISAR



Analisa estes projetos antes de decidir como integrá-los.



A. Remotion



https://github.com/remotion-dev/remotion



Documentação: https://www.remotion.dev/docs



Função:



- Compor vídeos com React.

- Criar animações através de código.

- Controlar duração, frames, transições e sequências.

- Incorporar texto, imagens, vídeos, música e narração.

- Criar composições reutilizáveis.

- Renderizar vídeos MP4 através de um ambiente de execução compatível.



Usa o Remotion como motor central de composição e renderização.



B. Prompt to Motion Graphics SaaS



https://github.com/remotion-dev/template-prompt-to-motion-graphics-saas



Este projeto deve ser analisado prioritariamente porque já aborda a geração de motion graphics a partir de instruções em linguagem natural.



Investiga a arquitetura de:



- Validação dos pedidos.

- Seleção de competências e exemplos de animação.

- Geração de código.

- Limpeza e validação do código.

- Pré-visualização.

- Composições e padrões de animação.



Reutiliza os componentes que forem adequados, respeitando a arquitetura existente, as dependências e as licenças.



Não assumes que este repositório já utiliza Gemini. Adapta o fornecedor de IA de forma explícita e testável.



C. Video Shotcraft



https://github.com/Vincentwei1021/video-shotcraft



Analisa o sistema de templates, receitas de planos, transições, movimento de câmara, sound design e composição cinematográfica.



Reutiliza, quando tecnicamente viável:



- Templates de vídeos promocionais.

- Animações de produtos.

- Movimentos de câmara 2.5D.

- Cortes sincronizados com música.

- Efeitos sonoros.

- Técnicas de composição visual.

- Referências de timing, ritmo e direção de arte.



Importante: este repositório é uma skill e um conjunto de recursos de produção audiovisual para agentes de código. Não o trates automaticamente como um pacote npm ou como um backend pronto a integrar.



Inspeciona os seus ficheiros, identifica os recursos reutilizáveis e adapta-os ao motor Remotion.



D. Graphite Editor



https://github.com/GraphiteEditor/Graphite



Avalia este projeto como recurso opcional para futuras funcionalidades gráficas e vetoriais.



Não tornes o Graphite uma dependência obrigatória da primeira versão. Só o integres se existir uma vantagem técnica clara, uma forma realista de integração e uma licença compatível.



Regra obrigatória



Antes de integrar qualquer repositório:



1. Analisa o README e o package.json.

2. Confirma a licença.

3. Identifica as dependências e os requisitos de execução.

4. Confirma a compatibilidade com o projeto atual.

5. Reutiliza código real sempre que possível.

6. Não afirmes que uma integração foi concluída sem a executar e testar.



---



4. ARQUITETURA TÉCNICA



Utiliza uma arquitetura organizada, segura e preparada para crescer.



Frontend



- React e TypeScript.

- Componentes reutilizáveis.

- Interface desenvolvida no Lovable.

- Tailwind CSS ou o sistema de estilos já existente.

- Pré-visualização dos vídeos.

- Editor de projetos.

- Gestão de estados de geração e renderização.



Não substituas desnecessariamente as tecnologias já existentes no projeto.



Backend



Implementa ou configura um backend Node.js compatível com Remotion.



Responsabilidades:



- Autenticação e autorização.

- Gestão de projetos.

- Integração segura com a Gemini API.

- Geração e validação de storyboards.

- Gestão de tarefas de renderização.

- Armazenamento e recuperação de ficheiros.

- Gestão de erros e registos técnicos.

- Limites de utilização e controlo de custos.



O backend deve ser executado num ambiente que suporte as dependências reais da renderização, incluindo Chromium e FFmpeg quando necessários.



Base de dados e armazenamento



Avalia Supabase para:



- Utilizadores.

- Projetos.

- Configurações dos vídeos.

- Histórico de gerações.

- Estado das tarefas.

- Metadados das narrações.

- Links dos vídeos exportados.



Utiliza armazenamento de objetos para os vídeos finais, áudios, imagens e outros ficheiros.



Configura políticas de acesso para que cada utilizador só possa aceder aos seus próprios projetos e ficheiros.



Publicação



- Frontend: Vercel.

- Código: GitHub.

- Backend e renderização: serviço compatível com Node.js e Remotion.

- Base de dados: Supabase, se aprovado após avaliação.



Não assumas que o Vercel consegue executar todos os renders pesados apenas por o frontend estar publicado.



---



5. GEMINI API — MOTOR DE INTELIGÊNCIA ARTIFICIAL



Utiliza a Gemini API para transformar instruções do utilizador em projetos de animação estruturados.



Documentação:

https://ai.google.dev/gemini-api/docs



A chave deve ser configurada exclusivamente através de variáveis de ambiente no backend.



Nunca exponhas a chave no frontend, no GitHub ou nos ficheiros enviados ao navegador.



Fluxo de geração



1. O utilizador descreve o vídeo.

2. A IA identifica o objetivo, o público e o estilo.

3. A IA cria um guião organizado por cenas.

4. Define a duração de cada cena.

5. Seleciona templates e componentes visuais aprovados.

6. Define textos, cores, movimentos, transições e elementos gráficos.

7. Prepara a narração.

8. Produz um storyboard estruturado.

9. O backend valida os dados.

10. O motor Remotion monta o vídeo.

11. O sistema apresenta uma pré-visualização.

12. O utilizador pode editar e exportar.



Prefere uma representação estruturada em JSON validado, seguida da composição com componentes de vídeo aprovados.



Não permitas que a IA execute livremente qualquer código JavaScript produzido por ela.



Se for necessária geração de código, utiliza um ambiente isolado, validação de sintaxe, restrições de importações, limites de recursos e tratamento seguro de erros.



Implementa tentativas de correção limitadas e controladas quando a geração falhar.



---



6. SISTEMA DE MOTION GRAPHICS



Cria uma biblioteca organizada de composições reutilizáveis.



Categorias iniciais:



- Cinematic Product Ads.

- Motion Typography.

- Logo Animation.

- Tech Promo.

- Social Media Ads.

- Business Presentation.

- Data Visualization.

- Explainer Videos.

- Educational Videos.

- App and Website Showcase.

- Luxury Brand Promo.

- Minimal Motion.

- 2.5D Camera Movement.

- Abstract Motion Graphics.



Cada composição deve permitir configurar:



- Texto.

- Cores.

- Imagens.

- Logótipo.

- Duração.

- Velocidade.

- Tipografia.

- Transições.

- Movimento de elementos.

- Música e efeitos sonoros.

- Proporção do vídeo.



Implementa técnicas profissionais, incluindo:



- Animações baseadas em spring.

- Entrada e saída de elementos.

- Kinetic typography.

- Máscaras e revelações.

- Parallax.

- Zoom e movimentos de câmara.

- Profundidade visual.

- Transições suaves.

- Sincronização com o ritmo musical.

- Composição tipográfica equilibrada.

- Hierarquia visual cinematográfica.



Não cries uma coleção de efeitos exagerados sem propósito. A IA deve selecionar os movimentos de acordo com a mensagem, a marca e o estilo solicitado.



---



7. NARRAÇÃO PROFISSIONAL COM INTELIGÊNCIA ARTIFICIAL



A narração é uma funcionalidade central, não um extra.



Analisa e integra a geração de voz através de um fornecedor de Text-to-Speech.



Primeira opção: Gemini TTS



Documentação:

https://ai.google.dev/gemini-api/docs/speech-generation



Avalia a disponibilidade do modelo, os idiomas, as vozes, os limites, os custos e a qualidade antes de implementar.



Segunda opção: ElevenLabs



Documentação:

https://elevenlabs.io/docs



Permite configurar um fornecedor alternativo, sem obrigar a usar os dois simultaneamente.



Funcionalidades de narração



O utilizador deve poder:



- Ativar ou desativar a narração.

- Escolher uma voz masculina ou feminina, conforme as opções reais do fornecedor.

- Selecionar idioma e variante linguística disponíveis.

- Escolher o estilo: publicitário, cinematográfico, documental, educativo, institucional ou emocional.

- Ajustar a velocidade e as pausas, quando suportadas.

- Ouvir uma amostra antes de gerar o vídeo.

- Regenerar a narração.

- Utilizar uma gravação própria, respeitando os formatos e limites definidos.

- Ajustar o volume da voz e da música.

- Ativar legendas sincronizadas.



Dá prioridade a vozes naturais em português. Avalia especificamente a pronúncia do português usado em Moçambique, sem prometer uma variante que o fornecedor não disponibilize.



Sincronização



1. Gerar o guião.

2. Dividir o texto por cenas.

3. Gerar o áudio.

4. Obter a duração real do áudio.

5. Calcular os tempos das cenas.

6. Ajustar a composição Remotion.

7. Gerar legendas sincronizadas.

8. Misturar música e efeitos sonoros.

9. Verificar o áudio final.



Quando forem necessários timestamps por palavra, utiliza alinhamento forçado ou reconhecimento de fala compatível. Não inventes timestamps a partir do texto.



Se a voz falhar, apresenta um erro claro e permite tentar novamente.



---



8. EDITOR VISUAL



Cria um editor acessível e funcional.



Área de pré-visualização



- Reprodutor de vídeo.

- Play e pausa.

- Controlo de volume.

- Navegação por frames ou tempo.

- Seleção da proporção.

- Pré-visualização das alterações.



Painel de propriedades



- Texto e tipografia.

- Cores.

- Posição dos elementos.

- Tamanho.

- Duração.

- Velocidade da animação.

- Transições.

- Imagens e logótipos.

- Música e narração.



Timeline



Implementa uma timeline inicial com faixas para:



- Vídeo e cenas.

- Textos.

- Narração.

- Música.

- Efeitos sonoros.



Permite selecionar uma cena, editar os seus parâmetros, reorganizar cenas e alterar a duração dentro dos limites suportados.



Inclui desfazer e refazer, guardar alterações e recuperar o projeto.



Não apresentes controlos de edição que não estejam ligados a alterações reais na composição.



---



9. FORMATOS E EXPORTAÇÃO



Suporta inicialmente:



- 9:16 — TikTok, Reels e Shorts.

- 16:9 — YouTube e vídeos horizontais.

- 1:1 — publicações quadradas.



Permite escolher a resolução e a qualidade de exportação de acordo com os recursos disponíveis.



Formato final principal: MP4 com vídeo H.264 e áudio AAC, quando suportados pela configuração de renderização.



A exportação deve:



1. Validar o projeto.

2. Confirmar os recursos necessários.

3. Criar uma tarefa de renderização.

4. Apresentar o progresso real.

5. Guardar o resultado.

6. Validar o ficheiro final.

7. Disponibilizar um botão funcional de download.



Não simules progresso. O estado deve refletir a tarefa real de renderização.



Se o render falhar, guarda a informação técnica necessária para diagnóstico e apresenta uma mensagem compreensível.



---



10. DASHBOARD



Cria um dashboard profissional com:



- Botão “Criar novo vídeo”.

- Projetos recentes.

- Histórico de vídeos.

- Estado das renderizações.

- Templates disponíveis.

- Biblioteca de recursos.

- Definições de narração.

- Configurações da conta.

- Gestão de armazenamento.

- Ajuda e documentação.



Cada projeto deve apresentar:



- Nome.

- Miniatura.

- Data de criação.

- Duração.

- Formato.

- Estado.

- Ações para abrir, editar, duplicar e eliminar.



Inclui estados vazios bem desenhados, mensagens de sucesso e erros claros.



---



11. FLUXO DE CRIAÇÃO



Cria um assistente de produção dividido em etapas.



Etapa 1 — Briefing



Campos:



- Descrição do vídeo.

- Objetivo.

- Público-alvo.

- Marca ou produto.

- Texto principal.

- Chamada para ação.

- Duração pretendida.



Etapa 2 — Direção criativa



Escolher:



- Estilo visual.

- Formato.

- Ritmo.

- Cores.

- Tipo de animação.

- Nível de complexidade.



Etapa 3 — Guião e narração



- Gerar guião.

- Editar texto.

- Selecionar voz.

- Ouvir amostra.

- Gerar narração.



Etapa 4 — Storyboard



Mostrar as cenas, a duração prevista, os textos e os elementos visuais.



Permitir alterar o storyboard antes de gerar o vídeo.



Etapa 5 — Geração



Montar as cenas com Remotion, integrar os recursos, sincronizar o áudio e preparar a composição.



Etapa 6 — Revisão



Pré-visualizar, corrigir textos, ajustar animações e testar o áudio.



Etapa 7 — Exportação



Gerar o MP4 final e disponibilizar o download.



O utilizador deve poder guardar o trabalho e retomá-lo mais tarde.



---



12. SEGURANÇA E CONTROLO DE CUSTOS



Implementa:



- Proteção de chaves API.

- Validação de entradas.

- Autenticação e autorização.

- Limites de duração e resolução.

- Limites de tamanho de ficheiros.

- Controlo de chamadas à IA.

- Limites de tarefas simultâneas.

- Proteção contra abuso.

- Validação dos recursos externos.

- URLs de download protegidos quando necessário.

- Registos de erros sem exposição de dados sensíveis.



Não prometas gerações ilimitadas ou gratuitas sem confirmar os custos dos fornecedores e da infraestrutura.



Não integres pagamentos fictícios. Se forem adicionados planos, estes devem corresponder a limites e permissões efetivamente implementados.



---



13. TESTES OBRIGATÓRIOS



Não consideres a aplicação concluída apenas porque a página abre.



Executa e verifica:



1. Instalação das dependências.

2. Compilação TypeScript.

3. Lint e testes disponíveis.

4. Ligação à Gemini API.

5. Geração de um storyboard válido.

6. Criação de uma composição Remotion.

7. Pré-visualização de uma animação.

8. Geração de uma narração real.

9. Sincronização de áudio e cenas.

10. Renderização de um MP4 real.

11. Reprodução do MP4 exportado.

12. Download do ficheiro.

13. Recuperação de um projeto guardado.

14. Comportamento quando a API falha.

15. Testes de utilização em telemóvel.

16. Verificação do build e deploy.



Cria pelo menos um vídeo de demonstração de 10 segundos, com texto animado, uma transição, narração e música de fundo, quando os serviços estiverem configurados.



Se uma integração depender de uma chave, de um serviço externo ou de credenciais ainda não fornecidas, identifica precisamente essa dependência.



Não substituas a integração real por dados falsos apenas para fazer o teste parecer concluído.



---



14. IMPLEMENTAÇÃO POR FASES



Fase 1 — Auditoria



Analisa o código existente, os repositórios, as dependências e as licenças.



Fase 2 — Fundação



Implementa a arquitetura de dados, o backend, a configuração das APIs e o primeiro motor de composição.



Fase 3 — Geração



Liga Gemini, storyboard, templates e Remotion.



Fase 4 — Narração



Implementa TTS, áudio, sincronização e legendas.



Fase 5 — Editor



Implementa pré-visualização, propriedades e timeline.



Fase 6 — Renderização



Configura as tarefas, o armazenamento, o MP4 e o download.



Fase 7 — Qualidade



Executa testes, corrige erros e prepara o deploy.



Não avances silenciosamente para funcionalidades avançadas enquanto o fluxo fundamental não funcionar.



Se a implementação completa for demasiado extensa para uma única execução, conclui uma fase de cada vez, mantendo a aplicação compilável e documentando o que falta.



---



15. REGRAS FINAIS



- Não cries apenas uma demonstração visual.

- Não inventes integrações ou resultados.

- Não substituas funcionalidades por botões decorativos.

- Não removas funcionalidades existentes sem necessidade.

- Não exponhas chaves API.

- Não executas código arbitrário gerado pela IA no navegador.

- Não afirmes que o vídeo foi exportado sem existir um ficheiro real.

- Não integres repositórios inteiros sem analisar a sua compatibilidade.

- Mantém a arquitetura modular, documentada e preparada para manutenção.

- Preserva a identidade visual branca e vermelha.

- Prioriza estabilidade, qualidade de animação, narração natural e uma experiência simples no telemóvel.



RESULTADO ESPERADO



Uma plataforma Motion Rest funcional, onde o utilizador escreve uma descrição, recebe um storyboard, escolhe uma voz, gera animações profissionais, acompanha a renderização, edita o resultado e descarrega um vídeo MP4 real.



Começa por auditar o projeto e apresentar um plano de implementação baseado no código existente. Em seguida, implementa a primeira fase funcional e testa-a antes de avançar.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6a3dc1ae-05a9-405d-b67d-5465d81cb19a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
