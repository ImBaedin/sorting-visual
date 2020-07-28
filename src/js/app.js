import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {defaultValue, bubbleSort, quickSort, modifyCode} from './editorDefault';
import Visual from './visual';

if (module.hot) {
	module.hot.accept();
}

const editor = monaco.editor.create(document.querySelector('#editor'), {
	value: defaultValue,
	language: 'javascript',
	theme: 'vs-dark',
});
setTimeout(() => {
	editor.layout();
}, 1);

function resize() {
	editor.layout();
}
window.addEventListener('resize', resize);
resize();

const bs = document.querySelector('#bubble');
const qs = document.querySelector('#quick');

bs.addEventListener('click', ()=>{
	editor.setValue(bubbleSort);
	reInit();
});

qs.addEventListener('click', ()=>{
	editor.setValue(quickSort);
	reInit();
});

const canvas = document.querySelector('#visual');
const delay = document.querySelector('#delay');
const size = document.querySelector('#size');
const run = document.querySelector('#run');
const shuffle = document.querySelector('#shuffle');
let sortingVisual = new Visual(canvas, size.value);

delay.oninput = function() {
	sortingVisual.sleepTime = Math.pow(this.value, 3);
}
sortingVisual.sleepTime = delay.value;

size.oninput = function() {
	reInit();
}

async function swap(i, j, runIndex) {
	if(runIndex !== runCount) return;
	await sortingVisual.swap(i, j);
}

async function compare(i, j, runIndex){
	if(runIndex !== runCount) return;
	return await sortingVisual.compare(i, j);
}

let runCount = 0;

run.addEventListener('click', async function () {
	sortingVisual.initSound();
	let code = editor.getValue();

	(0, eval)(modifyCode(code));

	runCount++;
	let sort = executeCode(swap, compare, runCount);

	sortingVisual.startTimer();
	await sort(sortingVisual.arr);
	sortingVisual.done();
});

shuffle.addEventListener('click', ()=>{
	reInit();
});

function reInit(){
	runCount++;
	sortingVisual.done();
	sortingVisual = new Visual(canvas, size.value);
	sortingVisual.sleepTime = Math.pow(delay.value, 3);
}