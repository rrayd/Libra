"use strict";

// генерируем веса чемоданов
var box_weight = [],
	box_group, box_number, box_weight_value;
// для возможности гарантированного уравновешивания весов 50:50
// создаем двухмерный массив с равновесными группами по 6 объектов
// ( в идеале, конечно группы должны быть с разным количеством объектов )
for (box_group = 0; box_group < 2; box_group++) {
	box_weight[box_group] = [];
	for (box_number = 0; box_number < 6; box_number++) {
		box_weight[box_group][box_number] = getRandomFloat(12, 24);
	}
}

// сравниваем вес двух групп, при необходимости корректируем до (пока примерно) равного
var box_group_weight = [],
	box_group_weight_diff;
getGroupWeight();
if (box_group_weight[0] > box_group_weight[1]) {
	box_group_weight_diff = box_group_weight[0] - box_group_weight[1];
	box_group_weight_diff = box_group_weight_diff / 6;
	// вычитаем разницу
	for (var i = 0; i < 6; i++) {
		box_weight[0][i] = box_weight[0][i] - box_group_weight_diff;
	}
}
if (box_group_weight[0] < box_group_weight[1]) {
	box_group_weight_diff = box_group_weight[1] - box_group_weight[0];
	box_group_weight_diff = box_group_weight_diff / 6;
	// вычитаем разницу
	for (var i = 0; i < 6; i++) {
		box_weight[1][i] = box_weight[1][i] - box_group_weight_diff;
	}
}
getGroupWeight();

// установка вычисленного веса элементам
var box_element = document.getElementsByClassName('bag'),
	box_cycle_id = 0,
	box_cycle_group = 0;
for (i = 0; i < 12; i++) {
	box_element[i].dataset.weight = box_weight[box_cycle_group][box_cycle_id];
	box_cycle_id++;
	if (box_cycle_id == 6) {
		box_cycle_group = 1;
		box_cycle_id = 0;
	}
}

// общий вес всех объектов после коррекции
var box_all_group_weight = box_group_weight[0] + box_group_weight[1];

// случайная генерация веса отдельного объекта
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// вычисление веса группы объектов
function getGroupWeight() {
	for (var i = 0; i < 2; i++) {
		box_group_weight[i] = box_weight[i].reduce(function(previousValue, currentValue, index, array) {
			return previousValue + currentValue;
		});
	}
}

// перенос объектов
var dragBag = {};
document.onmousedown = function(e) {
	// отменяем правый клик
	if (e.which != 1) {
		return;
	}
	// запрещаем выделение текста
	document.ondragstart = function() { return false };
	document.body.onselectstart = function() { return false };
	// доходим до объекта в dom
	var elem = e.target.closest('.bag');
	// если не bag
	if (!elem) return;
	dragBag.elem = elem;
	dragBag.elem.classList.remove('animated-bag');
	// сохраняем стартовую позицию
	dragBag.downX = e.pageX;
	dragBag.downY = e.pageY;
	// определяем смещение, чтобы сохранить положение под курсором
	var localCoords = getLocalCoords(dragBag.elem);
    dragBag.shiftX = dragBag.downX - localCoords.left;
    dragBag.shiftY = dragBag.downY - localCoords.top;
}
var dst = document.body.getElementsByClassName('drag-system-trigger');
document.onmousemove = function(e) {
	// ждем создания объекта
	if (!dragBag.elem) return;
	// показываем системный триггер для определения чаши
	dst[0].hidden = false;
	dst[1].hidden = false;
	// перемещаем объект в body, чтобы таскать его по всему полю
	document.body.appendChild(dragBag.elem);
	dragBag.elem.style.zIndex = 9000; // на всякий случай
	// потащили
	dragBag.elem.style.left = e.pageX - dragBag.shiftX + 'px';
	dragBag.elem.style.top = e.pageY - dragBag.shiftY + 'px';
}
document.onmouseup = function(e) {
	// начнем расчет состояния сцены, если перенос вообще был
	if (dragBag.elem) {
		libraCalcInit(e);
	}
	// почистим объект для новых данных
	dragBag = {};
}
function getLocalCoords(elem) {
  var box = elem.getBoundingClientRect();
  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}
// расчет состояния весов
function libraCalcInit(e) {
	var trigger = findTrigger(e);
	if (trigger == 'not-libra') {
		// возвращаем объект к собратьям
		var bagsContain = document.body.getElementsByClassName('bags'),
			localBagsCoords = getLocalCoords(bagsContain[0]);
			bagsContain[0].appendChild(dragBag.elem);
		dragBag.elem.style.left = e.pageX - dragBag.shiftX - localBagsCoords.left + 'px';
		dragBag.elem.style.top = '';
		dragBag.elem.style.bottom = 0 + 'px';
		// инициализируем расчет нагрузки
		libraCalc();
	} else {
		// ставим на платформу
		var triggerObject = document.body.getElementsByClassName(trigger),
			localTriggerCoords = getLocalCoords(triggerObject[0]);
		triggerObject[0].appendChild(dragBag.elem);
		dragBag.elem.style.left = e.pageX - dragBag.shiftX - localTriggerCoords.left + 'px';
		dragBag.elem.style.top = '';
		dragBag.elem.style.bottom = '0';
		// инициализируем расчет нагрузки
		libraCalc();
	}
}
function findTrigger(e) {
	var elem = document.elementFromPoint(e.clientX, e.clientY),
		trigger_state;
	if (elem.className == 'drag-system-trigger dst-left') {
		trigger_state = 'lt-left';
	} else if (elem.className == 'drag-system-trigger dst-right') {
		trigger_state = 'lt-right';
	} else {
		trigger_state = 'not-libra'
	}
	dst[0].hidden = true;
	dst[1].hidden = true;
	return trigger_state;
}
// непосредственный расчет нагрузки
function libraCalc () {
	var currentWeight = [],
		currentOurWeight = [],
		currentAmt = [],
		platform_left = document.body.getElementsByClassName('lt-left'),
		platform_right = document.body.getElementsByClassName('lt-right'),
		box_group,
		platform_percent = [];
	// количество объектов на платформе
	currentAmt[0] = platform_left[0].getElementsByClassName('bag').length;
	currentAmt[1] = platform_right[0].getElementsByClassName('bag').length;
	// вес отдельных элементов на платформе
	for (var box_group = 0; box_group < 2; box_group++) {
		currentWeight[box_group] = [];
		for (var j = 0; j < currentAmt[box_group]; j++) {
			if (box_group == 0) {
				currentWeight[box_group][j] = +platform_left[0].getElementsByClassName('bag')[j].dataset.weight;
			} else {
				currentWeight[box_group][j] = +platform_right[0].getElementsByClassName('bag')[j].dataset.weight;
			}
		}
	}
	// общий вес элементов на отдельной платформе
	for (var i = 0; i < 2; i++) {
		if (currentWeight[i].length == 1) {
			currentOurWeight[i] = +currentWeight[i];
			// запрос процента от общего веса на конкретной платформе
			platform_percent[i] = getPerc(currentOurWeight[i]);
		} else if (currentWeight[i].length > 1) {
			currentOurWeight[i] = 0;
			platform_percent[i] = 0;
			currentOurWeight[i] = currentWeight[i].reduce(function(previousValue, currentValue, index, array) {
										return previousValue + currentValue;
									});
			// запрос процента от общего веса на конкретной платформе
			platform_percent[i] = getPerc(currentOurWeight[i]);
		} else {
			currentOurWeight[i] = 0;
			platform_percent[i] = 0;
		}
	}
	console.log('процент от общего веса чемоданов на платформе 1 и 2: ' + platform_percent);
	getAxisDeg(platform_percent[0], platform_percent[1]);
	getPlatformBias(platform_percent[0], platform_percent[1]);
}
// расчет процента от общего веса на отдельной платформе
function getPerc(groupWeight) {
	var perc;
	perc = 100 * groupWeight / box_all_group_weight;
	return perc;
}
// расчет наклона указателя
function getAxisDeg (perc_0, perc_1) {
	var deg = perc_1 - perc_0;
	// сокращаем максимумы наклона до необходимых 44 градусов
	if ( deg >= 50 ) {
		deg = 50;
	} else if ( deg <= -50 ) {
		deg = -50;
	}
	deg = deg / 1.13;
	// назначаем угол указателю
	document.body.getElementsByClassName('libra-part-arrow')[0].style.transform = 'rotate('+ deg + 'deg)';

	console.log('угол наклона указателя: ' + deg);

	getPlatformBias();
	return deg;
}
// расчет смещения платформ
function getPlatformBias (perc_0, perc_1) {
	var deg = perc_1 - perc_0,
		bias = [];
	if ( deg >= 50 ) {
		deg = 50;
	} else if ( deg <= -50 ) {
		deg = -50;
	}
	deg = deg / 2;
	deg = deg * 1.28;
	if ( Math.sign(deg) == -1 ) {
		bias[0] = -1 * deg;
		bias[1] = 1 * deg;
		// назначаем смещение платформам
		document.body.getElementsByClassName('libra-part-platform-right')[0].style.marginTop = bias[1] + 'px';
		document.body.getElementsByClassName('libra-part-platform-left')[0].style.marginTop = bias[0] + 'px';
	} else {
		bias[0] = -1 * deg;
		bias[1] = 1 * deg;
		// назначаем смещение платформам
		document.body.getElementsByClassName('libra-part-platform-right')[0].style.marginTop = bias[1] + 'px';
		document.body.getElementsByClassName('libra-part-platform-left')[0].style.marginTop = bias[0] + 'px';
	}
}