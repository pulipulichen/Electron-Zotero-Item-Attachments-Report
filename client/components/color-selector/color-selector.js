
/* global ClipboardUtils, FileUtils */

module.exports = {
  data () {
    return {
      colorPicked: null,
      resolve: null,
      modal: null,
      currentColorSet: null,
      highlightColor: null,
      colorSets: [
        {
          name:'sementic',
          label: 'Sementic UI',
          colors: [
            [
              '#db2828',
              '#f2711c',
              '#fbbd08',
              '#b5cc18',
              '#21ba45',
            ],
            [
              '#ffe8e6',
              '#ffedde',
              '#fff8db',
              '#fbfdef',
              '#e5f9e7',
            ],
            [
              '#00b5ad',
              '#2185d0',
              '#6435c9',
              '#a333c8',
              '#e03997',
            ],
            [
              '#e1f7f7',
              '#dff0ff',
              '#eae7ff',
              '#f6e7ff',
              '#ffe3fb',
            ],
            [
              '#a5673f',
              '#f1e2d3',
              '#767676',
              '#f8f8f9',
              '#1b1c1d',
            ]
          ]
        },
        {
          name:'flat',
          label: 'Flat UI',
          colors: [
            [
              '#1abc9c',
              '#2ecc71',
              '#3498db',
              '#9b59b6',
              '#34495e',
            ],
            [
              '#16a085',
              '#27ae60',
              '#2980b9',
              '#8e44ad',
              '#2c3e50'
            ],
            [
              '#f1c40f',
              '#e67e22',
              '#e74c3c',
              '#ecf0f1',
              '#95a5a6',
            ],
            [
              '#f39c12',
              '#d35400',
              '#c0392b',
              '#bdc3c7',
              '#7f8c8d'
            ]
          ]
        }
      ]
    }
  },
  async mounted () {
    if (!this.currentColorSet) {
      this.currentColorSet = this.colorSets[0].name
    }
    
    this.modal = $(this.$refs.Modal).modal({
      autofocus: false,
      onHide: () => {
        //console.log(this.colorPicked)
        this.resolve(this.colorPicked)
      }
    })
  },
//  watch: {
//    
//  },
  computed: {
    colorSetList () {
      return this.colorSets.map(s => s.name)
    },
    currentColors () {
      for (let i = 0; i < this.colorSets.length; i++) {
        if (this.colorSets[i].name === this.currentColorSet) {
          return this.filterColors(this.colorSets[i].colors)
        }
      }
      
      return this.filterColors(this.colorSets[0].colors)
    }
  },
  methods: {
    filterColors (colors) {
      let maxColumns = 0
      colors = colors.map(line => {
        if (line.length > maxColumns) {
          maxColumns = line.length
        }
        return line.map(color => color.toUpperCase())
      })
      
      colors = colors.map(line => {
        while (line.length < maxColumns) {
          line.push('')
        }
        return line
      })
      
      return colors
    },
    selectColor (color) {
      this.searchColor(color)
      
      return new Promise((resolve) => {
        this.colorPicked = null
        this.resolve = resolve
        //this.modal.modal('onHidden', () => {
        //  console.log(this.colorPicked)
        //  resolve(this.colorPicked)
        //}).modal('show')
        this.modal.modal('show')
      })
    },
    searchColor (color) {
      if (!color) {
        return false
      }
      this.highlightColor = null
      color = color.toUpperCase()
      let foundSet = null
      for (let i = 0; i < this.colorSets.length; i++) {
        if (foundSet) {
          break
        }
        
        let colors = this.colorSets[i].colors
          
        for (let j = 0; j < colors.length; j++) {
          if (foundSet) {
            break
          }
          
          for (let k = 0; k < colors[j].length; k++) {
            if (color === colors[j][k].toUpperCase()) {
              foundSet = this.colorSets[i].name
              this.highlightColor = color
              break
            }
          }
        }
        
      }
      if (foundSet) {
        this.currentColorSet = foundSet
      }
    },
    select (color) {
      this.colorPicked = color
      this.modal.modal('hide')
    }
  }
}