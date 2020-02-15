function novoElemento(tagName, className) {         //Função construtora
    const elem = document.createElement(tagName)
    elem.className = className // pode ser usado classList também
    return elem
}

function Barreira (reversa = false) {                   /* Recebe elemento DOM */
    this.elemento = novoElemento('div', 'barreira')     /* Chama outra função passando div e a classe */

    const borda = novoElemento('div', 'borda') 
    const corpo = novoElemento('div', 'corpo')

    //Dessa forma garantimos a criação do elemento de barreira reversa e normal
    this.elemento.appendChild(reversa ? corpo : borda) // A barreira é reversa ? Se sim, adiciona corpo / Senão adiciona borda
    this.elemento.appendChild(reversa ? borda : corpo) // A barreira é reversa ? Se sim, adiciona borda / Senão adiciona corpo

    //Para ter variação de altura nas barreiras
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

/*Teste de criação de barreira
const b = new Barreira(true)        //Instanciando a função, e passando true como parametro (reversa)
b.setAltura(300)                    //Define tamanho da barreira
document.querySelector('[wm-flappy]').appendChild(b.elemento)  */


function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    //É possível usar const superior = new Barreira, mas precisaremos do this para referenciar a função construtora (função mais abrangente)
    this.superior = new Barreira(true)      //Para superior instancia a função como true = reversa
    this.inferior = new Barreira(false)     //Para omferopr instancia a função como false = normal

    //Adiciona os 2 elementos dentro da div criada (par-de-barreiras)
    this.elemento.appendChild(this.superior.elemento)  //.elemento pois está instanciada a função contrutora
    this.elemento.appendChild(this.inferior.elemento)  //ou seja, .elemento faz parte da função construtora

    this.sortearAbertura = () => {  //Função responsável por sortear o tamanho das barreiras
        const alturaSuperior = Math.random() * (altura - abertura) //Exemplo= 0,2 * (300px - 30px)  = 52px ---- Tendo abertura fixa de 30px
        const alturaInferior = altura - abertura - alturaSuperior  //Exemplo= 300px - 30px - 52px = 218px (restante)
        
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    //Recebe valor string (ex : 200px), remove o px e e transforma para inteiro
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    //'100px'.split('px') ele retorna um array ["100",""], por isso pegamos o indice 0

    //Seta a nova posição, parametro recebido na função construtora
    this.setX = x => this.elemento.style.left = `${x}px`

    //Pega a largura do client
    this.getLargura = () => this.elemento.clientWidth

    //Chama as 2 funções
    this.sortearAbertura()
    this.setX(x)
}

/* Teste de criação de barreira dupla e de tamanho aleatório
//Instancia a função construtora e passa 700 de altura, 200 de abertura e 400 em x
const b = new ParDeBarreiras(700, 200, 400)
document.querySelector('[wm-flappy]').appendChild(b.elemento) */

//Função responsável por criar multiplas barreiras
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    //Espacamento entre as barreiras criadas, ou seja, cria 4 barreiras com a mesma distância entre elas
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    //Constante responsável pela velocidade
    const deslocamento = 3
    
    //Função responsável pela animação (deslocamento das barreiras)
    this.animar = () => {
        //Passa por cada par
        this.pares.forEach(par => {
            //Para cada par, pega o valor de X (largura) e subtrai pelo deslocamento
            par.setX(par.getX() - deslocamento)

            //Quando o elemento sair do jogo
            if (par.getX() < -par.getLargura()) { //Quando x = 0 for menor que a largura do par de barreira
                //joga a barreira pra posição final
                par.setX(par.getX() + espaco * this.pares.length) //posição atual + espaço * tamanho do vetor (4 elementos)
                par.sortearAbertura() // Sorteia novamente a abertura para dar a impressão de que é uma nova barreira
            }

            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio  //Se atender condição, a variável retorna true
                && par.getX() < meio
            if(cruzouMeio) notificarPonto() //Se true, chama função de somar ponto
        })
    }
}

function Passaro(alturaJogo) { //Precisa ter um limite para saber até onde o passaro vai voar
    let voando = false         //Quando true = passaro voando, false = passaro caindo
    
    //Adiciona elemento img com classe passaro
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png' //Adiciona diretório da img

    //Função que pega o valor de Y em relação a base da borda criada na div
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]) //Flaz o split e transforma pra int pegando apenas valor 
    this.setY = y => this.elemento.style.bottom = `${y}px`                //Assim que chamado com valor (Int) retorna em string com px / Exemplo: y = 100, retorna 100px

    window.onkeydown = e => voando = true //Quando tecla pressiona
    window.onkeyup = e => voando = false // Quando soltar a tecla

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5) //Se voando igual true, add 8px / Se voando igual false, sub 5px
        const alturaMaxima = alturaJogo - this.elemento.clientHeight //Subtrai tamanho do passario (60px) - tamanho do Jogo

        if (novoY <= 0) {   //Se for menor que 0 (limite inferior)
            this.setY(0)    //Seta posição do passaro em 0
        } else if (novoY >= alturaMaxima) { //Se for maior ou igual limite superior 
            this.setY(alturaMaxima)         //Seta posição como limite superior
        } else {                   //Se não foi nenhuma das 2 (tiver entre os limites)
            this.setY(novoY)       //Recebe o valor normal
        }
    }

    this.setY(alturaJogo / 2)
}

/* Teste de animação 
const barreiras = new Barreiras(700, 1100, 200, 400)        //Instancia função construtora acima
const passaro = new Passaro(700)
const areaDoJogo = document.querySelector('[wm-flappy]')    //area do jogo recebe div com atributo wm-flappy

areaDoJogo.appendChild(passaro.elemento)
barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento)) //Adiciona elemento dentro da div
setInterval(() => {
    barreiras.animar()
    passaro.animar()
},20) */

function Progresso() {
    this.elemento = novoElemento('span', 'progresso') //Cria span de classe progresso
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos //Escreve dentro do span o valor dos pontos
    }
    this.atualizarPontos(0)
}


function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()   //Pega o retangulo associado ao elemento
    const b = elementoB.getBoundingClientRect()   //Pega as dimensões do elemento 

    const horizontal = a.left + a.width >= b.left //Distancia entre borda e elemento A + largura do elemento A é maior que lado esquerdo de B?
        && b.left + b.width >= a.left             //Distancia entre borda e elemento B + largura do elemento B é maior que distancia entre borda e elemento A?
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) //Passa passaro para elemento A e barreira superior para elemento B
                || estaoSobrepostos(passaro.elemento, inferior)    //Passa passaro para elemento A e barreira inferior para elemento B
        }
    })
    return colidiu //retorna true ou false
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    //Distancia entre barreiras 2, distancia entre pares de barreiras
    const barreiras = new Barreiras(altura, largura, 200, 400, 
        () => progresso.atualizarPontos(++pontos)) //Ao passar pelo meio, chama a função que incrementa os pontos
    const passaro = new Passaro(altura) //Define o passaro

    //Adiciona no jogo (poe elemento dentro da div do jogo)
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        //loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)) { //Se colidiu
                clearInterval(temporizador) //Para o temporizador
            }
        }, 20)
    }
}

//Instancia a função principal e chama função start (animação)
new FlappyBird().start() 