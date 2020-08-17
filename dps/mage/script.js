Vue.component(
	'custom-checkbox',
	{
		template: `
<div class="col-md-1">
	<label class="btn btn-primary" :class="[value? '':'gray']" :title=title>
		<img :src=src class="img-thumbnail img-check"/>
		<input type="checkbox" class="hidden" autocomplete="off"
			:value="name"
			v-model="checked"
			@change="onChange"
		/>
	</label>
</div>
`,
		props: [
			"src",
			"value",
			"name",
			"title",
		],
		data () {
			return {
				checkedProxy: false
			}
		},
		computed: {
			checked: {
				get () {
					return this.value
				},
				set (val) {
					this.checkedProxy = val
				}
			}
		},
		methods: {
			onChange: function(e) {
				this.$emit('input', this.checkedProxy)
			}
		}
	}
)

Vue.component(
	'custom-input',
	{
		template: `
<div class="row">
	<div class="col-md-9">
		<div class="input-group" v-bind:class="{'has-warning' : hasWarning}">
			<div class="input-group-prepend">
				<span class="input-group-text">{{name}}</span>
			</div>
			<input
				type="number"
				class="form-control"
				:placeholder=name
				v-bind:value="value"
				v-on:input="$emit('input', $event.target.value)"
			/>
			<div v-if="hasWarning" class="input-group-btn">
				<button class="btn btn-default" @click="normalize">
					{{warning}}
				</button>
			</div>
		</div>
	</div>
	<div class="col-md-3">
		<slot></slot>
	</div>
</div>
`,
		props: [
			'name',
			'value',
			'min',
			'max',
		],
		watch: {
			value: function (c,p) {
				let n = +(("" + c).replace(',','.'))
				if (isNaN(n) || c === "") {
					n = 0
				}

				if (n !== c) {
					this.value= n
				}
			}
		},
		methods: {
			normalize: function () {
				let n = this.value
				if (undefined !== this.min && n < this.min) {
					this.value = this.min
				}
				if (undefined !== this.max && n > this.max) {
					this.value = this.max
				}
				this.$emit('input', this.value)
			},
		},
		computed: {
			warning: function () {
				let n = this.value
				if (undefined !== this.min && n < this.min) {
					return "min value is " + this.min
				}
				if (undefined !== this.max && n > this.max) {
					return "max value is " + this.max
				}
				return ""
			},
			hasWarning: function () {
				return this.warning.length > 0
			}
		}
	},
)

var app = new Vue({
	el: '#app',
	data: {
		roundValues: true,
		spd: 419,
		damage: "(440+475)/2",
		crit: 5,
		totalhit: 95,
		casttime: 2.5,
		intellect: 400,
		active: 61.5,
		parts: [],
		result: 0,
		setBonus: true,
		head: true,
	},
	computed: {
		formula: function () {
			this.result = +(eval(this.damage))
			var res = ""

			res = this.wrap(this.damage, "ice arrow default damage")
			res = this.add(res, this.spd * (this.casttime / 3), "spd * coef")
			res = this.mul(res, (100 + this.totalCrit)/100, "crit")
			res = this.mul(res, this.totalhit/100, "hit")
			res = this.div(res, this.casttime, "casttime")
			if (this.setBonus) {
				res = this.mul(res, 1.10, "set bonus")
			}
			res = this.mul(res, this.active / 100, "active in fight")

			this.result = this.round100(this.result)
			return res
		},
		intCrit: function () {
			return this.intellect / 59.5
		},
		totalCrit: function () {
			var crit = (+this.crit + this.intCrit)
			if (this.head) {
				crit += 10
			}
			return crit
		}
	},
	methods: {
		wrap: function (text, title="") {
			var rounded = text
			if (!isNaN(+text)) {
				rounded = this.round100(text)
			}
			return `<span title="${title} (${text})">${rounded}</span>`
		},
		add: function (left, right, title="") {
			this.result += +right
			return `(${left} + `+this.wrap(right,title) + ')'
		},
		mul: function (left, right, title="") {
			this.result *= +right
			return `${left} * `+this.wrap(right,title)
		},
		div: function (left, right, title="") {
			this.result = this.result / (+right)
			return `${left} / `+this.wrap(right,title)
		},
		round100: function (val) {
			if (!this.roundValues) {
				return val
			}
			return Math.round(val*100)/100
		}
	},
})
