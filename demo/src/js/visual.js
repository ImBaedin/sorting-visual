if (typeof AudioContext == 'undefined') {
	AudioContext = webkitAudioContext;
}

function shuffle(array) {
	array.sort(() => Math.random() - 0.5);
}

function norm(value, min, max) {
	return (value - min) / (max - min);
}

async function sleep(time = 1) {
	if (time === 0) return;
	await new Promise((resolve) => setTimeout(resolve, time));
}

class Visual {
	constructor(canvas, size) {
		this.sleepTime = 10;
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		this.comparing = [];
		this.swapping = [];
		this.dim = { width: 0, height: 0 };
		this.arr = [];

		this.startTime = 0;
		this.timeSlept = 0;
		this.lastTime = 0;

		for (let i = 0; i < size; i++) {
			this.arr.push(i + 1);
		}

		shuffle(this.arr);

		window.addEventListener('resize', () => {
			this.resize();
		});
		setTimeout(() => this.resize(false), 1);
		this.animate();
	}

	resize() {
		let p = this.canvas.parentElement;
		if (p) {
			this.canvas.width = p.clientWidth;
			this.canvas.height = p.clientHeight;
		}
		if (
			this.dim.width !== this.canvas.width ||
			this.dim.height !== this.canvas.height
		) {
			this.dim.width = this.canvas.width;
			this.dim.height = this.canvas.height;
		}
	}

	startTimer() {
		this.startTime = performance.now();
		this.timeSlept = 0;
	}

	initSound() {
		if (this.track) return;
		this.audio = new AudioContext();

		const master = this.audio.createGain();
		master.gain.setValueAtTime(0.2, this.audio.currentTime);
		master.connect(this.audio.destination);

		this.track = this.audio.createGain();
		this.track.gain.setValueAtTime(0, this.audio.currentTime);
		this.track.connect(master);

		this.tone = this.audio.createOscillator();

		// this.tone.type = 'sine';
		this.tone.type = 'triangle';
		this.tone.frequency.value = 440;
		this.tone.connect(this.track);
		this.tone.start();
	}

	async compare(i, j) {
		this.comparing = [i, j];
		if (this.sleepTime > 10) await this.sleep(this.sleepTime);
		this.comparing = [];
		return this.arr[i] > this.arr[j];
	}

	async swap(i, j) {
		this.swapping = [i, j];
		if (this.sleepTime > 0) {
			this.tone.frequency.linearRampToValueAtTime(
				norm(this.arr[j], 0, this.arr.length) * 400 + 100,
				this.audio.currentTime
			);
			this.track.gain.cancelScheduledValues(this.audio.currentTime);
			this.track.gain.linearRampToValueAtTime(1, this.audio.currentTime);
			this.track.gain.linearRampToValueAtTime(
				0,
				this.audio.currentTime + this.sleepTime * 2
			);
		}
		await this.sleep(this.sleepTime * 2);
		let temp = this.arr[i];
		this.arr[i] = this.arr[j];
		this.arr[j] = temp;
		this.swapping = [];
	}

	async sleep(time) {
		const start = performance.now();
		await sleep(time);
		this.timeSlept += performance.now() - start;
	}

	done() {
		if (this.track) {
			this.track.gain.cancelScheduledValues(0);
			this.track.gain.linearRampToValueAtTime(0, this.audio.currentTime);
		}

		if (this.startTime !== 0) {
			this.lastTime = performance.now() - this.startTime - this.timeSlept;
			this.startTime = 0;
		}
	}

	getTimer() {
		if(this.startTime === 0) return this.lastTime;
		return performance.now() - this.startTime - this.timeSlept;
	}

	animate() {
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.dim.width, this.dim.height);
		requestAnimationFrame(this.animate.bind(this));
		const offset = this.dim.width / this.arr.length;
		const lineWidth = (this.dim.width / this.arr.length) * 0.75;

		this.arr.forEach((num, index) => {
			this.ctx.fillStyle = 'white';
			const height = (num / this.arr.length) * this.dim.height;
			const x = index * offset;
			const y = this.dim.height - height;

			if (this.swapping[0] === index || this.swapping[1] === index)
				this.ctx.fillStyle = 'red';
			if (this.comparing[0] === index || this.comparing[1] === index)
				this.ctx.fillStyle = 'orange';

			this.ctx.fillRect(x, y, lineWidth, height);
		});

		this.ctx.fillStyle = 'white';
		this.ctx.font = '25px monospace';
		this.ctx.fillText(Math.round(this.getTimer())+'ms', 10, 25);
	}
}

export default Visual;
