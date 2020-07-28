export const defaultValue = `
// Here you can write a function to sort the above array
// The function accepts one argument which is the array to sort

// The only thing you need to know is that you have access to 2 functions to help,
// compare(a, b) and swap(a, b)
// They're pretty self explanatory, but they each accept 2 arguments, which are both indexes of elements in the array.
// 'compare' simply return true or false: true if arr[a] is bigger and false if they're the same or arr[a] is smaller
// 'swap' is also simple, as it just accepts 2 indexes and swaps values

// This is just a weird bubble sort implementation
function sort(arr){
	for(let i = 0; i < arr.length - 1; i++){
		const forward = i % 2 === 0;

		if(forward){
			for(let j = 0; j < arr.length - 1; j++){
				if (compare(j, j + 1)) {
					swap(j, j+1);
				}
			}
		}
		else{
			for(let j = arr.length; j > 1; j--){
				if (compare(j, j + 1)) {
					swap(j, j+1);
				}
			}
		}
	}
}
`;

export const bubbleSort = `
// This is a basic sorting function called bubble sort

function sort(arr){
	let len = arr.length - 1;
	for (let i = 0; i < len; i++) {
		for (let j = 0; j < len; j++) {
			if (compare(j, j + 1)) {
				swap(j, j+1);
			}
		}
	}
	return arr;
}
`;

export const quickSort = `
// This is a slightly more complex sorting algorithm called quick sort

function sort(arr) {
	const recursiveSort = (start, end) => {
		if (end - start < 1) {
			return;
		}

		let splitIndex = start;
		for (let i = start; i < end; i++) {
			const sort = compare(i, end);

			if (!sort) {
				if (splitIndex !== i) {
					swap(splitIndex, i);
				}
				splitIndex++;
			}
		}

		swap(end, splitIndex);

		recursiveSort(start, splitIndex - 1);
		recursiveSort(splitIndex + 1, end);
	};

	recursiveSort(0, arr.length - 1);
	return arr;
}
`;

export const before = `
function executeCode(swap, compare, runIndex){
	return(
`;

export const after = `
		)
}
`;

export const modifyCode = (code) => {
	let funcs = [];

	// This code replaces all fat-arrow function with async versions
	code = code.replace(/(?:const|let)(.*)\s*=\s*(async)?[ \t]*\((.*)\)\s*=>\s*{/gm, (match, p1, p2, p3)=>{
		// We need to find all calls to this function and make them await
		funcs.push(p1.trim());
		if(p2) return match;
		return `const ${p1} = async (${p3}) => {`;
	});

	// This code replaces all normal function with async versions
	code = code.replace(/(async)?[ \t]*function(.*)\((.*)\)\s*{/gm, (match, p1, p2)=>{
		// We need to find all calls to this function and make them await
		funcs.push(p2.trim());
		if(p1) return match;
		return ` async ${match}`;
	});

	funcs.forEach(f=>{
		const re = new RegExp(`\\S*(await)?[ \\t]*${f}\\((.*)\\)\\s*`, "g");
		code = code.replace(re, (callMatch, callP1)=>{
			if(callP1 || callMatch.includes('function')) return callMatch;
			return ` await ${callMatch}`;
		});
	});

	//This code replaces all the compare calls with await ones
	code = code.replace(/(await)?[ \t]*compare\((.+?),(.+?)\)/gm, (match, p1, p2, p3) => {
		return `await compare(${p2},${p3}, runIndex)`;
	});

	//This code replaces all the swap calls with await ones
	code = code.replace(/(await)?[ \t]*swap\((.+?),(.+?)\)/gm, (match, p1, p2, p3) => {
		return `await swap(${p2},${p3}, runIndex)`;
	});

	return before + code + after;
};