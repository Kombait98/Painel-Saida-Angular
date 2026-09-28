# Painel de Saída - Escola

Este é um sistema voltado para otimizar o fluxo de liberação e saída de alunos em escolas, substituindo a comunicação por interfone entre a portaria e as salas de aula por um painel digital em tempo real, desenvolvido em **Angular**.

## 🎯 O Que o Sistema Faz

No horário de saída, o processo costuma ser caótico com muitos pais na portaria e professores tentando entender qual aluno deve descer. Esta aplicação resolve isso com dois painéis interativos:

1. **Painel da Portaria (Porteiro):**
   - Seleciona a turma do aluno através do celular ou tablet.
   - Solicita a descida do aluno com um clique ("Chamar Aluno").
   - Pode chamar o aluno novamente caso a descida atrase.
   - Quando a criança chega, valida a entrega para o responsável ("Entregue ao Pai").
   
2. **Painel da Sala de Aula (Professor):**
   - Visualiza a sua turma específica.
   - Recebe notificações visuais instantâneas quando a portaria chama um aluno ("Portaria Chamando").
   - Mantém o porteiro atualizado alterando o status do aluno para "Arrumando" ou notificando quando ele "Desceu".
   - Cada alteração possui um contador de tempo para evitar chamadas duplicadas ou alunos "esquecidos".

### ⚡ Destaques Técnicos
- **Mobile-first:** Layout e paleta de cores pensados para uso facilitado no celular sob a luz do dia (botões grandes, design espaçado).
- **Angular Signals:** Reatividade local moderna para as mudanças de estado.
- **BroadcastChannel API:** As mudanças de status sincronizam automaticamente entre as abas do navegador, permitindo um "teste em tempo real" sem necessidade de backend ou WebSocket configurado na máquina.
- **Time Ago:** Uso de Pipes para exibir o tempo desde a última ação (ex: "Atualizado há 15 seg").

---

## 🚀 Como Executar o Projeto Localmente

Este projeto foi construído utilizando o [Angular CLI](https://github.com/angular/angular-cli).

### Pré-requisitos
- Node.js instalado na máquina.
- Angular CLI instalado (`npm install -g @angular/cli`).

### Passos

1. Acesse a pasta raiz do projeto no seu terminal:
   ```bash
   cd painel-saida
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```
   *(ou rode `ng serve`)*

4. O aplicativo ficará disponível no seu navegador acessando `http://localhost:4200/`.

### Como Testar a Mágica Acontecendo (Sincronização)
Para simular a interação real entre a portaria e o professor:
1. Abra `http://localhost:4200` em **duas abas ou janelas diferentes** e coloque-as lado a lado.
2. Na aba 1, entre como **Porteiro**. Na aba 2, entre como **Professor**.
3. Selecione a mesma turma em ambas as abas (Ex: "Turma E").
4. Na aba da Portaria, chame um aluno. Imediatamente a aba do Professor será atualizada. Responda pelo professor e veja o status na portaria mudar automaticamente!
