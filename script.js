/* Setup */

const curvaModel = {
  points: [],
  pointsUp: [],
  pointsDown: [],
  vetores: [],
  espessuraDefault: 50,
  numeroPontos: 0,
  numeroTestes: 100,
  pontoAtual: -1,
}

var curvas = [{...curvaModel}];
var index = 0;
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d');
var move = false;

var showPoints = true;
var showPoligons = true;
var showCurve = true;


function resizeCanvas() {
  canvas.width = parseFloat(window.getComputedStyle(canvas).width);
  canvas.height = parseFloat(window.getComputedStyle(canvas).height);
}

resizeCanvas();

/* Vetor / Utils */

function normalizar(v1){
  var vt = {x: v1.x/v1.norma, y: v1.y/v1.norma, norma: 1};
  return vt;
}

function subtraiVetor(v1, v2){
  var newX = v1.x - v2.x;
  var newY = v1.y - v2.y;
  var vt = {x: newX, y: newY, norma: Math.sqrt(newX*newX + newY*newY)};
  return vt;
}

function produtoInterno (v1, v2){
  return ((v1.x * v2.x) + (v1.y + v2.y));
}

function anguloVetor(v1, v2){
  return ( (produtoInterno(v1, v2)) / (v1.norma * v2.norma) );
}
function ortogonal(v1){
  var vt = {x: vq.y, y: -v1.x, norma: Math.sqrt(v1.y*v1.y + v1.x*vq.x)};
  return vt;
}


/* Calculo dos novos pontos */

var vtPontos;

function novosPontos(curva){
	curva.vetores = [];

	for(var cont1 = 0; cont1 < (curva.numeroPontos - 1) ; cont1++){

		var xt = (curva.points[cont1 + 1].x - curva.points[cont1].x);
		var yt = (curva.points[cont1 + 1].y - curva.points[cont1].y);
		var vet = {x: xt, y: yt, norma: Math.sqrt(xt*xt + yt*yt)};
		curva.vetores.push(vet);
		curva.vetores[cont1] = normalizar(curva.vetores[cont1]);//vetor já normalizado

	}//todos os vetores obtidos

	curva.pointsUp = [];
	curva.pointsDown = [];
	//zerando os dois pontos

	for (var i = 0; i < curva.points.length; i++) {
		var coordPointsTemp = { x: curva.points[i].x, y: curva.points[i].y};
		var coordPointsTemp1 = { x: curva.points[i].x, y: curva.points[i].y};
		curva.pointsUp.push(coordPointsTemp);
		curva.pointsDown.push(coordPointsTemp1);
	}



	for(var cont = 0; cont < (curva.vetores.length - 1) ; cont++) {

		if(anguloVetor(curva.vetores[cont + 1], curva.vetores[cont]) != -1){//caso os 3 pontos nao sejam colineares
			vtPontos = subtraiVetor(curva.vetores[cont + 1], curva.vetores[cont]);
		}else{
			vtPontos = ortogonal(curva.vetores[cont]);//pode haver confusao, corrigir
		}

		vtPontos = normalizar(vtPontos);


		curva.pointsDown[cont + 1].x = (vtPontos.x * (-curva.points[cont+1].e)) + curva.points[cont+1].x;
		curva.pointsDown[cont + 1].y = (vtPontos.y * (-curva.points[cont+1].e)) + curva.points[cont+1].y;

		curva.pointsUp[cont + 1].x = (vtPontos.x * curva.points[cont+1].e) + curva.points[cont+1].x;
		curva.pointsUp[cont + 1].y = (vtPontos.y * curva.points[cont+1].e) + curva.points[cont+1].y;



	}
}


//----------------------Canvas-------------------------------------



/* Interação */

function AddCurva() {
  curvas.push({...curvaModel, points: [],
    pointsUp: [],
    pointsDown: [],
    vetores: [],});
  index = curvas.length - 1;
}

function RemoveCurva() {
  curvas.splice(index, 1);
  index = 0;
}

function ChangeCurva() {
  if(curvas.length > index + 1) {
    index++;
  } else {
    index = 0;
  }
}

function togglePoints(){
  if (showPoints===true){
      showPoints = false;

  }else if ( showPoints ===false){
      showPoints = true;

  }
}

function togglePoligons(){
  if (showPoligons===true){
    showPoligons = false;

  }else if ( showPoligons ===false){
      showPoligons = true;

  }
}

function toggleCurve(){
  if (showCurve===true){
      showCurve = false;

  }else if ( showCurve ===false){
      showCurve = true;

  }
}

function dist(p1, p2) {
  var v = {x: p1.x - p2.x, y: p1.y - p2.y};
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function getIndex(click) {
  for (var i in curvas[index].points) {
    if (dist(curvas[index].points[i], click) <= 10) {
      return i;
    }
  }
  return -1;
}


/* Render */

function drawPoints(curva) {
  //desenha os pontos
  for (var i in curva.points) {
    if(showPoints === true){
	    ctx.beginPath();
	    ctx.arc(curva.points[i].x, curva.points[i].y, 6, 0, 2 * Math.PI);
		  ctx.fillStyle = 'purple';
	  }
    ctx.fill();

  // desenha os poligonos
    if(showPoligons === true){
      if(i > 0){
        ctx.beginPath();
        var xAtual = curva.points[i-1].x;
        var yAtual = curva.points[i-1].y;
        ctx.moveTo(xAtual, yAtual);
        ctx.lineTo(curva.points[i].x, curva.points[i].y);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

  }

  if(curva.numeroPontos > 2) {
	  novosPontos(curva);
    if(showCurve === true){
      calcularPontosCurva(curva);
    }

	}
}

setInterval(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);//redesenha o canvas
  for(let j = 0; j < curvas.length; j++) {
    drawPoints(curvas[j]);
  }
}, 100);



function drawCurve(pointsCurve, curva) {
  if(curva.numeroPontos > 2) {
    for(var i in pointsCurve) {
      ctx.beginPath();

      if(i > 0) {
        var xAtual = pointsCurve[i-1].x;
        var yAtual = pointsCurve[i-1].y;
        ctx.moveTo(xAtual, yAtual);
        ctx.lineTo(pointsCurve[i].x, pointsCurve[i].y);
        ctx.strokeStyle =  curva === curvas[index] ? "green" : "red";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }
}

function calcularPontosCurva(curva) {
  var pointsCurve = [];
  //para cada avaliacao:
  //var t = 1/2;
  var t = 0;
  for(var cont = 0; cont < curva.numeroTestes; t = t + 1/curva.numeroTestes, cont++){
  	var pointsDeCasteljau = curva.points.slice(0, curva.numeroPontos + 1);
    //para cada nivel:
    for(n = 1; n < curva.numeroPontos; n++) {
      //para cada ponto:
      for(p = 0; p < curva.numeroPontos - n; p++) {
        var cordX = (1 - t) * pointsDeCasteljau[p].x + t * pointsDeCasteljau[p+1].x;
        var cordY = (1 - t) * pointsDeCasteljau[p].y + t * pointsDeCasteljau[p+1].y;
        pointsDeCasteljau[p] = {x: cordX, y: cordY};
      }
    }
    pointsCurve.push(pointsDeCasteljau[0]);
  }
  drawCurve(pointsCurve, curva);
}


/* Listeners */

canvas.addEventListener('keydown', e => {
  if(curvas[index].pontoAtual != -1 && curvas[index].pontoAtual != 0 && curvas[index].pontoAtual != curvas[index].numeroPontos - 1 && curvas[index].numeroPontos > 2) {
    switch(e) {
        case 38://valor correspondente a 'ArrowUp'
        curvas[index].points[curvas[index].pontoAtual].e = curvas[index].points[curvas[index].pontoAtual].e + 1;
          drawPoints(curvas[index]);
        break;
        case 40://valor correspondente a 'ArrowDown'
        curvas[index].points[curvas[index].pontoAtual].e = curvas[index].points[curvas[index].pontoAtual].e - 1;
          drawPoints(curvas[index]);
        break;
        default: return;
    }
    e.preventDefault();
  }
});

canvas.addEventListener('mousemove', e => {
  if(move){
    var antigo = curvas[index].points[i];
    curvas[index].points[i] = {x: e.offsetX, y: e.offsetY, e: antigo.e};
    drawPoints(curvas[index]);
  }
});

canvas.addEventListener('mouseup', e => {
  move = false;
});


canvas.addEventListener('dblclick', e => {
    if (i !== -1) {
        curvas[index].points.splice(i, 1);
        curvas[index].numeroPontos--;
    }
});


canvas.addEventListener('mousedown', e => {
  var click = {x: e.offsetX, y: e.offsetY, e:curvas[index].espessuraDefault};
  i = getIndex(click);
  console.log(curvas);
  if (i === -1) {
    curvas[index].numeroPontos = curvas[index].numeroPontos + 1;
    curvas[index].points.push(click);
    curvas[index].pontoAtual = curvas[index].numeroPontos - 2;
    drawPoints(curvas[index]);
  } else {
    move = true;
    curvas[index].pontoAtual = i;
  }

});

$('#num_avaliacoes').on('change',function(event){//Funcao para editar o numero de avaliações
	curvas[index].numeroTestes = (event.target.value);
	drawPoints(curvas[index]);
})
