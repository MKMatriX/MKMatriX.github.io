Vue.component(
		'talent',
		{
				template: `
<div class="col-md-1">
	<label
				class="btn btn-primary"
				:class="[value > 0? '':'gray']"
				:title=title
				@click.prevent="inc"
				@contextmenu.prevent="dec"
		>
		<img :src="fullSrc" class="img-thumbnail"/>
		<input
				class="hidden"
				type="number"
				v-bind:value="value"
				v-on:input="$emit('input', $event.target.value)"
		/>
		<div class="talent-count">
				{{value}} / {{max}}
		</div>
	</label>
</div>
`,
				props: [
						"src",
						"value",
						"title",
						"max",
				],
				methods: {
						inc: function () {
								this.value++
								if (this.value > this.max) {
										this.value = +this.max
								}
								this.$emit('input', this.value)
						},
						dec: function () {
								this.value--
								if (this.value < 0) {
										this.value = 0
								}
								this.$emit('input', this.value)
						},
				},
				computed: {
						fullSrc: function () {
								return 'https://wow.zamimg.com/images/wow/icons/large/' + this.src
						}
				},
		}
)
Vue.component(
		'custom-checkbox',
		{
				template: `
<div class="col-md-1">
	<label class="btn btn-primary" :class="[value? '':'gray']" :title=title>
		<img :src="fullSrc" class="img-thumbnail img-check"/>
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
						},
						fullSrc: function () {
								return 'https://wow.zamimg.com/images/wow/icons/large/' + this.src
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
				initialInt: 127.1,
				roundValues: true,
				spd: 416,
				damage: "(440+475)/2",
				crit: 5,
				totalhit: 95,
				casttime: 3,
				intellect: 159+16+14+12+9+37+3,
				active: 61.5,
				result: 0,

				setBonus: true,
				zandTrink: true,

				buffs: {
						head: true,
						zand: true,
						dm: true,
						flower: false,
						dmf: false,
						dmfInt: false,
						int: true,

						motw: true,
						blessing: true,

						mindElixir: false,
						juju: false,
						runtum: false,
						oil: true,
						icePower: true,
						arcanePower: true,
						greatPower: true,
				},

				talents: {
						fbCastTime: 5,
				},

				history: [],
				holdHistory: false,
		},
		computed: {
				formula: function () {
						this.result = +(eval(this.damage))
						var res = ""

						res = this.wrap(this.damage, "ice arrow default damage")
						res = this.add(res, this.totalSpd * (this.totalCastTime / 3), "spd * coef")
						res = this.mul(res, (100 + this.totalCrit)/100, "crit")
						res = this.mul(res, this.totalhit/100, "hit")
						res = this.div(res, this.totalCastTime, "casttime")
						if (this.setBonus) {
								res = this.mul(res, 1.10, "set bonus")
						}
						if (this.buffs.dmf) {
								res = this.mul(res, 1.10, "darkmoon festival damage")
						}
						res = this.mul(res, this.active / 100, "active in fight")

						var percent = 0
						var added = "0"
						var result = this.result
						var last = this.history.length - 1 - this.holdHistory
						if (this.history.length > 0) {
								var lastRes = this.history[last].result
								added = this.result - lastRes
								added = "" + (added > 0? "+"+added: added)
								percent = added * 100 / lastRes
						}
						this.history[last + 1] = {percent, result, added}
						this.result = this.round100(this.result)
						return res
				},
				totalCastTime: function () {
						return this.casttime - (this.talents.fbCastTime * 0.1)
				},
				intCrit: function () {
						return this.totalInt / 59.5
				},
				totalSpd: function () {
						let spd = +this.spd

						if (this.buffs.arcanePower) {
								spd += 35
						}
						if (this.buffs.icePower) {
								spd += 15
						}
						if (this.buffs.greatPower) {
								spd += 150
						}
						if (this.buffs.oil) {
								spd += 36
						}

						if (this.zandTrink) { // assuming 7 attacs
								spd += (204*7-(17*(0+1+2+3+4+5+6)))/120
						}

						return spd
				},
				totalCrit: function () {
						var crit = (+this.crit + this.intCrit)
						if (this.buffs.head) {
								crit += 10
						}
						if (this.buffs.dm) {
								crit += 3
						}
						if (this.buffs.flower) {
								crit += 5
						}
						if (this.buffs.oil) {
								crit += 1
						}
						return crit
				},
				totalInt: function () { // 429
						var int = this.initialInt + (+this.intellect)

						if (this.buffs.int) {
								int += 31
						}
						if (this.buffs.flower) {
								int += 15
						}
						if (this.buffs.mindElixir) {
								int += 25
						}
						if (this.buffs.juju) {
								int += 30
						}
						if (this.buffs.runtum) {
								int += 10
						}
						if (this.buffs.motw) {
								int += 16
						}

						if (true) { // gnome
								int *= 1.05
						}
						if (this.buffs.blessing) {
								int *= 1.1
						}
						if (this.buffs.zand) {
								int *= 1.15
						}
						if (this.buffs.dmfInt) {
								int *= 1.1
						}

						return Math.round(int)
				},
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
				},
				toggle_buffs: function (type) {
						switch (type) {
								case 'clothes':
										var toggle = !this.setBonus
										this.setBonus = toggle
										this.zandTrink = toggle
										break;
								case 'wb':
										var toggle = !this.buffs.head
										this.buffs.head = toggle
										this.buffs.zand = toggle
										this.buffs.dm = toggle
										this.buffs.flower = false
										this.buffs.dmfInt = false
										this.buffs.dmf = false
										break;
								case 'b':
										var toggle = !this.buffs.motw
										this.buffs.int = true
										this.buffs.motw = toggle
										this.buffs.blessing = toggle
										break;
								case 'chem':
										var toggle = !this.buffs.greatPower
										this.buffs.greatPower = toggle
										this.buffs.icePower = toggle
										this.buffs.arcanePower = toggle
										this.buffs.oil = toggle
										this.buffs.runtum = false
										this.buffs.mindElixir = false
										this.buffs.juju = false
										break;
								case 'talents':
										break;
						}
				}
		},
})
