//Variables del Score Zone
let pscore = 0;
let gscore = 0;

//Boolean para determinar si existe al menos un fantasma
let ghost = false;
let ghost2 = false; // Segundo fantasma

/**
 * Clase Player que contendrá atributos relacionados al render del personaje, su sprite,
 * su ubicación con coordenadas en el canvas y otros
 */
let player = {
    x: 50,
    y: 50,
    pacmouth: 320,
    pacdir: 0,
    speed: 7,
}

/**
 * Clase Enemy que, al igual que el Objeto Player, tendrá atributos de renderizado,
 * de posición, de velocidad y  un contador de movimiento
 */
let enemy = {
    x: 150,
    y: 250,
    ghostChar: 0,
    animation: 0,
    enemydir: 0,
    speed: 5,
    moving: 0,
    dirx: 0,
    diry: 0,
    animationCountdown: 0
}

/**
 * Adición de un segundo enemigo (no de la mejor manera, ya que esto nos hará
 * repetir bastante código...)
 */
let enemy2 = {
    x: 150,
    y: 250,
    ghostChar: 0,
    animation: 0,
    enemydir: 0,
    speed: 5,
    moving: 0,
    dirx: 0,
    diry: 0,
    animationCountdown: 0
}

/**
 * Clase Powerdot que representará el powerup para comer a los fantasmas. 
 * El boolean powerup representa cuando será visible el powerdot
 * El pcountdown determina la cuenta atrás antes de que aparezca otro powerdot
 * ghostNum guardará el color de fantasma para restaurarlo cuando acabe el efecto del powerup
 */
let powerdot = {
    x: 0,
    y: 0,
    powerup: false,
    pcountdown: 0,
    ghostNum: 0,
    ghostNum2: 0,
    ghostEat: false
}

//Creación del canvas y primeros seteos
let canvas = document.createElement("canvas");
let context = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 400;

//Seteo de la imagen principal
let mainImage = new Image();
let powerdotImage = new Image();
//powerdotImage.src = "../img/powerdot.png"
mainImage.src = "../img/pac.png";
mainImage.ready = false;
mainImage.onload = checkReady;

//Generación de un Objeto vacio para trackear clicks del Usuario
let keyclick = {}

//EventListener de las teclas apretadas en el teclado
document.addEventListener("keydown", function (event) {
    keyclick[event.key | event.keyCode] = true;
    move(keyclick);
}, false);

//EventListener de cuando se suelta una tecla para eliminar el contenido
//del Objeto keyclick
document.addEventListener("keyup", function (event) {
    delete keyclick[event.key | event.keyCode];
}, false);

/**
 * Método que mueve al jugador actualizando su nueva posición y renderizandola.
 * Si se descomentan los else, se evita que se detecten más de una tecla apretada al
 * mismo tiempo, lo que evita el movimiento diagonal
 * @param {Objeto con los codigos ASCII de las teclas apretadas} keyclick 
 */
function move(keyclick) {
    //Move left
    if (37 in keyclick) { player.x -= player.speed; player.pacdir = 64; } // else
    //Move up
    if (38 in keyclick) { player.y -= player.speed; player.pacdir = 96; } // else 
    //Move right
    if (39 in keyclick) { player.x += player.speed; player.pacdir = 0; } // else
    //Move down
    if (40 in keyclick) { player.y += player.speed; player.pacdir = 32; }

    /* Avoiding the player going off of canvas by teleporting it to the opposite side */
    if (player.x > (canvas.width - 32)) { player.x = 0 }
    if (player.x < 0) { player.x = canvas.width - 32 }
    if (player.y > (canvas.height - 32)) { player.y = 0 }
    if (player.y < 0) { player.y = canvas.height - 32 }

    //Pac-Man mouth animation
    if (player.pacmouth == 320) {
        player.pacmouth = 352
    } else {
        player.pacmouth = 320
    }

    //Renderizar gráficos
    render();
}

/**
 * Función que cheque cuando se cargue la imagen principal y larga el juego principal
 */
function checkReady() {
    this.ready = true;
    playgame();
}

/**
 * Función que ejecuta el juego principal.
 * Cuenta con un requestAnimationFrame para repetir en loop la animación del juego.
 */
function playgame() {
    requestAnimationFrame(playgame);
    render();
}

/**
 * Función que devuelve un número random entre 0 y el número anterior enviado como parámetro
 * @param {*} n 
 * @returns 
 */
function randomNum(n) {
    return Math.floor(Math.random() * n);
}

/**
 * Método que renderizará la parte gráfica de nuestro juego
 */
function render() {
    //Canvas o fondo del juego
    context.fillStyle = "#131c21";
    context.fillRect(0, 0, canvas.width, canvas.height);

    /* Si no existe un superdot, se crea uno en una posición random y se le da el alta*/
    if (!powerdot.powerup && powerdot.pcountdown <= 0) {
        powerdot.x = randomNum(canvas.width - 60) + 30;
        powerdot.y = randomNum(canvas.height - 60) + 30;
        powerdot.powerup = true;
    }


    /* Si el fantasma no existe, elijo uno de los 5 disponibles de manera random, lo ubico en una posición
    random, guardo en el atributo 'enemyanimation' que color de fantasma es y lo seteo en true para que deje
    de seguir creando más fantasmas  */
    if (!ghost) {
        enemy.ghostChar = randomNum(5) * 64;
        enemy.x = randomNum(450) + 100;
        enemy.y = randomNum(250) + 100;
        ghost = true;
    }

    //Segundo fantasma
    if (!ghost2) {
        enemy2.ghostChar = randomNum(5) * 64;
        enemy2.x = randomNum(450) + 100;
        enemy2.y = randomNum(250) + 100;
        ghost2 = true;
    }

    /* En este if designamos el movimiento que tendrá el fantasma. Si llega a negativo, reinicializamos el valor
    de movimiento del fantasma siendo este un número aleatorio entre 0 y 9, multiplicado por 3 y sumado por 1 o 2
    También la velocidad en cada tramo será aleatoria entre 1 y 5. */
    if (enemy.moving < 0) {
        enemy.moving = (randomNum(20) * 3) + (randomNum(2) + 1); //Hacerlo par o impar
        enemy.speed = (randomNum(5) + 1);

        //Variables de dirección
        enemy.dirx = 0;
        enemy.diry = 0;

        /* Si el fantasma puede ser comido, multiplicamos la velocidad por -1 para invertir la dirección del
        fantasma y así hacer que huya del jugador. */
        if (powerdot.ghostEat) {
            enemy.speed *= -1;
        }

        /* Si el número aleatorio que me tocó es par, me moveré horizontalmente intentando ir hacia
        la dirección del jugador. Si el número random es impar, me moveré verticalmente igualmente
        buscando al jugador.
        Si el fantasma no está en modo 'comestible', cambiaré el valor del eje Y a renderizar del fantasma
        para mover sus ojos en la dirección que vaya a dirigirse */
        if (enemy.moving % 2) {
            if (player.x < enemy.x) {
                enemy.dirx = -enemy.speed;
                if (!powerdot.ghostEat) {
                    enemy.enemydir = 64;
                }
            } else {
                enemy.dirx = enemy.speed;
                if (!powerdot.ghostEat) {
                    enemy.enemydir = 0;
                }
            }
        } else {
            if (player.y < enemy.y) {
                enemy.diry = -enemy.speed;
                if (!powerdot.ghostEat) {
                    enemy.enemydir = 96;
                }
            } else {
                enemy.diry = enemy.speed;
                if (!powerdot.ghostEat) {
                    enemy.enemydir = 32;
                }
            }
        }
    }

    //Incrementos o decrementos para crear acción en el enemigo
    enemy.x += enemy.dirx;
    enemy.y += enemy.diry;

    //Decremento el tramo restante del fantasma
    enemy.moving--;

    //Avoiding the enemy to go off canvas by teleporting it
    if (enemy.x > (canvas.width - 32)) { enemy.x = 0 }
    if (enemy.x < 0) { enemy.x = canvas.width - 32 }
    if (enemy.y > (canvas.height - 32)) { enemy.y = 0 }
    if (enemy.y < 0) { enemy.y = canvas.height - 32 }


    // -------- MOVIMIENTO 2ND FANTASMA --------
    if (enemy2.moving < 0) {
        enemy2.moving = (randomNum(20) * 3) + (randomNum(2) + 1); //Hacerlo par o impar
        enemy2.speed = (randomNum(5) + 1);

        //Variables de dirección
        enemy2.dirx = 0;
        enemy2.diry = 0;

        /* Si el fantasma puede ser comido, multiplicamos la velocidad por -1 para invertir la dirección del
        fantasma y así hacer que huya del jugador. */
        if (powerdot.ghostEat) {
            enemy2.speed *= -1;
        }

        /* Si el número aleatorio que me tocó es par, me moveré horizontalmente intentando ir hacia
        la dirección del jugador. Si el número random es impar, me moveré verticalmente igualmente
        buscando al jugador.
        Si el fantasma no está en modo 'comestible', cambiaré el valor del eje Y a renderizar del fantasma
        para mover sus ojos en la dirección que vaya a dirigirse */
        if (enemy2.moving % 2) {
            if (player.x < enemy2.x) {
                enemy2.dirx = -enemy2.speed;
                if (!powerdot.ghostEat) {
                    enemy2.enemydir = 64;
                }
            } else {
                enemy2.dirx = enemy2.speed;
                if (!powerdot.ghostEat) {
                    enemy2.enemydir = 0;
                }
            }
        } else {
            if (player.y < enemy2.y) {
                enemy2.diry = -enemy2.speed;
                if (!powerdot.ghostEat) {
                    enemy2.enemydir = 96;
                }
            } else {
                enemy2.diry = enemy2.speed;
                if (!powerdot.ghostEat) {
                    enemy2.enemydir = 32;
                }
            }
        }
    }

    //Incrementos o decrementos para crear acción en el enemigo
    enemy2.x += enemy2.dirx;
    enemy2.y += enemy2.diry;

    //Decremento el tramo restante del fantasma
    enemy2.moving--;

    //Avoiding the enemy to go off canvas by teleporting it
    if (enemy2.x > (canvas.width - 32)) { enemy2.x = 0 }
    if (enemy2.x < 0) { enemy2.x = canvas.width - 32 }
    if (enemy2.y > (canvas.height - 32)) { enemy2.y = 0 }
    if (enemy2.y < 0) { enemy2.y = canvas.height - 32 }

    /* Collision detection (ghosts) Cálculos para determinar cuando Pac-Man colisiona con el fantasma
    y todo lo que ocurre cuando eso pasa */
    if ((player.x <= (enemy.x + 26) && enemy.x <= (player.x + 26) &&
        player.y <= (enemy.y + 26) && enemy.y <= (player.y + 26)) ||
        (player.x <= (enemy2.x + 26) && enemy2.x <= (player.x + 26) &&
            player.y <= (enemy2.y + 26) && enemy2.y <= (player.y + 26))) {
        console.log('ghost hit');

        //Determinamos si el fantasma podia ser comido en la colisión
        if (powerdot.ghostEat) {
            pscore++;
        } else {
            gscore++;
        }

        //Reiniciamos posición del jugador
        player.x = 10;
        player.y = 100;

        //Reiniciamos posición de los fantasma
        enemy.x = 300;
        enemy.y = 200;
        enemy2.x = 350;
        enemy2.y = 250;

        //Contador de tiempo del power-up baja directamente a 0
        powerdot.pcountdown = 0;
    }

    /* Collision detection (superdot) Cálculos para determinar cuando Pac-Man come el power-up,
    y todo lo que ocurre cuando eso pasa*/
    if (player.x <= powerdot.x && powerdot.x <= (player.x + 32) &&
        player.y <= powerdot.y && powerdot.y <= (player.y + 32)) {
        console.log('hit');
        powerdot.powerup = false; //Desaparecer powerdot
        powerdot.pcountdown = 500; //Cuenta atras hasta el próximo powerdot
        powerdot.ghostNum = enemy.ghostChar - enemy.animation; //Guardo el color del fantasma - el valor de animación para evitar que se corra el sprite
        powerdot.ghostNum2 = enemy2.ghostChar - enemy2.animation;
        enemy.ghostChar = 384; //Seteo el sprite de fantasma azul
        enemy.enemydir = 0; //Same as above
        enemy.animation = 0; //Reseteo el valor de animación para evitar bugs
        enemy2.ghostChar = 384;
        enemy2.enemydir = 0;
        enemy2.animation = 0;
        powerdot.x = 0; // Saco de la pantalla el powerdot para evitar bugs
        powerdot.y = 0; // Same as above
        powerdot.ghostEat = true; //El fantasma puede ser comido
        player.speed = 10; // Aumentamos la velocidad del jugador
    }

    /* Si el fantasma puede ser comido, se resta la cuenta atrás del power-up hasta que sea igual o menor a 0
    y el fantasma vuelva a su estado normal con su color original */
    if (powerdot.ghostEat) {
        powerdot.pcountdown--;

        //Animación flash del fantasma 
        if (powerdot.pcountdown % 10 == 0) {
            if (enemy.animation == 0) {
                enemy.animation = 32;
                enemy.enemydir += enemy.animation;
            } else {
                enemy.enemydir -= enemy.animation;
                enemy.animation = 0;
            }
            // Animación flash 2do fantasma
            if (enemy2.animation == 0) {
                enemy2.animation = 32;
                enemy2.enemydir += enemy2.animation;
            } else {
                enemy2.enemydir -= enemy2.animation;
                enemy2.animation = 0;
            }
        }



        //Fin de la cuenta atrás y vuelta a la normalidad
        if (powerdot.pcountdown <= 0) {
            powerdot.ghostEat = false; // El fantasma ya no puede ser comido
            enemy.ghostChar = powerdot.ghostNum; // Volvemos al sprite original del fantasma guardado en el powerdot
            enemy2.ghostChar = powerdot.ghostNum2;
            player.speed = 7; // Volvemos a la velocidad original del personaje
            enemy.animation = 0; // Reseteamos animation para evitar que queden residuos que provoquen bugs en los sprites
            enemy2.animation = 0;
        }
    } else {

        // Animaciones del fantasma en su estado normal. Se utiliza un contador de animación que va de 0 a 20.
        if (enemy.animationCountdown > 0) {
            enemy.animationCountdown--;
        } else {
            enemy.animationCountdown = 20;
        }

        //2do fantasma
        if (enemy2.animationCountdown > 0) {
            enemy2.animationCountdown--;
        } else {
            enemy2.animationCountdown = 20;
        }

        /* Si el contador está en 0 o en 10 (límites opuestos de tiempo) se genera el cambio de animación
        moviendo el eje X de la porción de imagen a renderizar (se mueve a su sprite a la derecha y vuelve
            a la izquierda) */
        if (enemy.animationCountdown == 0) {
            enemy.animation = 32;
            enemy.ghostChar += enemy.animation;
        } else if (enemy.animationCountdown == 10) {
            enemy.ghostChar -= enemy.animation;
            enemy.animation = 0;
        }

        //2do fantasma
        if (enemy2.animationCountdown == 0) {
            enemy2.animation = 32;
            enemy2.ghostChar += enemy2.animation;
        } else if (enemy2.animationCountdown == 10) {
            enemy2.ghostChar -= enemy2.animation;
            enemy2.animation = 0;
        }
    }

    //Gráficos del superdot
    if (powerdot.powerup) {
        context.fillStyle = "#ffffff";
        context.beginPath();
        context.arc(powerdot.x, powerdot.y, 7, 0, Math.PI * 2, true);
        //context.fillRect(powerdot.x, powerdot.y, 10, 10); // Cuadrado de prueba
        context.closePath();
        context.fill();
    }


    //Gráficos del jugador y los enemigos
    context.drawImage(mainImage, enemy.ghostChar, enemy.enemydir, 32, 32, enemy.x, enemy.y, 32, 32);
    context.drawImage(mainImage, enemy2.ghostChar, enemy2.enemydir, 32, 32, enemy2.x, enemy2.y, 32, 32);
    context.drawImage(mainImage, player.pacmouth, player.pacdir, 32, 32, player.x, player.y, 32, 32);

    //Score zone
    context.font = "20px Verdana";
    context.fillStyle = "#ffffff";
    context.fillText("Pacman: " + pscore + " VS Ghosts: " + gscore, 2, 18);
}

//Append del canvas dentro del <body>
document.body.appendChild(canvas);

