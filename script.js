const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

//AIzaSyC5XW4L444ee_vemulIHfJxcy7U6mpGck0

const perguntarAI = async (question, game, apiKey) => {
  const model = 'gemini-2.5-flash';
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const pergunta = `
    ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}.

    ## Tarefa
        Você deve responder perguntas do usuario sobre estratégias, builds e dicas para o jogo ${game}.

    ## Regras
        - Se você não sabe a resposta, diga que não sabe.
        - Não tente adivinhar ou inventar uma resposta.
        - Se a pergunta não for sobre o jogo ${game}, reponda com "Essa pergunta não está relacionada ao Jogo".
        - Considere a data atual ${new Date().toLocaleDateString(
          'pt-BR'
        )} para responder perguntas sobre o meta atual do jogo.
        - Faça pesquisas sobre o patch atual, baseado na data atual, para uma resposta mais precisa.
        - Nunca responda itens que vc não tenha certeza que exista no patch atual

    ## Resposta
        -Economize na suas respostas, seja objetivo e direto ao ponto. -Responda apenas o necessário para responder a pergunta do usuário.
        - Responda em Markdown
        - Não é necessario saudação ou despedidas, apenas responda a pergunta do usuário.

    ## Exemplo de resposta
        - pergunta do usuario: "Qual é a melhor formação meta no EAFC25?"
        - resposta: "A melhor formação meta no EAFC25 é /n/n
        **Itens:** /n/n- coloque os itens
        **tipo de produndidade:/n/n**
        **Altura da linha:**/n/n- coloque a altura da linha

        ---
    Aqui está a pergunta do usuário: "${question}"`;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: pergunta,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];
  //chamada API
  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contents, tools }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const sendForm = async (event) => {
  event.preventDefault();

  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  console.log({ apiKey, game, question });

  if (apiKey == '' || game == '' || question == '') {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  //Desabilita botão enquanto a requisição está sendo feita
  askButton.disabled = true;
  askButton.textContent = 'Perguntando...';
  askButton.classList.add('loading');

  try {
    // perguntar pra IA
    const text = await perguntarAI(question, game, apiKey);
    aiResponse.querySelector('.response-content').innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao enviar o formulário:', error);
    return;
  } finally {
    askButton.disabled = false;
    askButton.textContent = 'Perguntar';
    askButton.classList.remove('loading');
  }
};

form.addEventListener('submit', sendForm);
