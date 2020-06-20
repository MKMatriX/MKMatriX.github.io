const proc = (x, y = 0) => {
	let count = 1
	if (y == 1 || y == 3) {
		count = 4
	}
	if (y == 2) {
		count = 6
	}
	return count * (x**y) * ((1-x)**(4-y)) * 100
}

const allProcs = (resistPercent) => {
	let res = [];
	for (let i = 4; i >= 0; i--) {
		res.push(proc(resistPercent,i))
	}
	return res
}

const resist2percent = (r, el = 63) => Math.min((3*r / (el*20)), 0.75)

var app = new Vue({
	el: '#app',
	data: {
		resist: 0,
		saved: []
	},
	computed: {
		damage: function () {
			return resist2percent(this.resist)
		},
		procs: function () {
			return allProcs(this.damage)
		}
	},
	methods: {
		save: function() {
			this.saved.push({
				resist: this.resist,
				damage: this.damage,
				procs: this.procs,
			})
			this.resist = 0
		},
		reset: function() {
			this.saved = []
		}
	},
	watch: {
		resist: function (c,p) {
			let n = parseInt(c)
			if (isNaN(n) || c === "") {
				this.resist = 0
			} else if (n !== c) {
				this.resist = n
			}
		}
	}
})