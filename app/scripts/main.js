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

// -- functions
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

// определяем 