
/* global ClipboardUtils, FileUtils, shell */

module.exports = {
  data () {
    return {
      name: 'Test APP',
      short_name: 'APP',
      background_color: '#FFF',
      theme_color: '#E1F7F7',
      description: 'Test description',
      iconsPath: 'img/favicon/',
      copiedManifestJSON: true,
      copiedHeaderHTML: true,
      searchFaviconQuery: '',
      inited: false
    }
  },
  async mounted () {
    this.dataLoad()
    
    setTimeout(() => {
      this.inited = true
    }, 500)
  },
  watch: {
    name () {
      if (this.inited === false) {
        return false
      }
      
      this.dataSave()
      this.copiedManifestJSON = false
    },
    short_name () {
      if (this.inited === false) {
        return false
      }
      
      this.dataSave()
      this.copiedManifestJSON = false
    },
    background_color () {
      if (this.inited === false) {
        return false
      }
      
      this.dataSave()
      this.copiedManifestJSON = false
    },
    theme_color () {
      if (this.inited === false) {
        return false
      }
      
      this.dataSave()
      this.copiedManifestJSON = false
      this.copiedHeaderHTML = false
    },
    description () {
      if (this.inited === false) {
        return false
      }
      
      this.dataSave()
      this.copiedManifestJSON = false
    },
    iconsPath () {
      if (this.inited === false) {
        return false
      }
      
      this.dataSave()
      this.copiedManifestJSON = false
      this.copiedHeaderHTML = false
    }
  },
  computed: {
    manifestJSON () {
      let iconsPath = this.iconsPath
      
      if (!iconsPath.endsWith('/')) {
        iconsPath = iconsPath + '/'
      }
      
      return `{
  "name": "${this.name}",
  "short_name": "${this.short_name}",
  "start_url": ".",
  "display": "standalone",
  "background_color": "${this.background_color}",
  "theme_color": "${this.theme_color}",
  "description": "${this.description}",
  "icons": [{
    "src": "${iconsPath}favicon.png",
    "sizes": "512x512",
    "type": "image/png"
  },
  {
   "src": "${iconsPath}android-icon-36x36.png",
   "sizes": "36x36",
   "type": "image\/png",
   "density": "0.75"
  },
  {
   "src": "${iconsPath}android-icon-48x48.png",
   "sizes": "48x48",
   "type": "image\/png",
   "density": "1.0"
  },
  {
   "src": "${iconsPath}android-icon-72x72.png",
   "sizes": "72x72",
   "type": "image\/png",
   "density": "1.5"
  },
  {
   "src": "${iconsPath}android-icon-96x96.png",
   "sizes": "96x96",
   "type": "image\/png",
   "density": "2.0"
  },
  {
   "src": "${iconsPath}android-icon-144x144.png",
   "sizes": "144x144",
   "type": "image\/png",
   "density": "3.0"
  },
  {
   "src": "${iconsPath}android-icon-192x192.png",
   "sizes": "192x192",
   "type": "image\/png",
   "density": "4.0"
  }
]
}`
    },
    headerHTML () {
      let iconsPath = this.iconsPath
      
      if (!iconsPath.endsWith('/')) {
        iconsPath = iconsPath + '/'
      }
      
      return `    <link rel="apple-touch-icon" sizes="57x57" href="${iconsPath}apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="${iconsPath}apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="${iconsPath}apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="${iconsPath}apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="${iconsPath}apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="${iconsPath}apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="${iconsPath}apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="${iconsPath}apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="${iconsPath}apple-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="192x192"  href="${iconsPath}android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="${iconsPath}favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="${iconsPath}favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="${iconsPath}favicon-16x16.png">
    <meta name="msapplication-TileColor" content="${this.theme_color}">
    <meta name="msapplication-TileImage" content="${iconsPath}ms-icon-144x144.png">
    <meta name="theme-color" content="${this.theme_color}">
    <link rel="manifest" href="./manifest.json">`
    }
  },
  methods: {
    dataLoad () {
      let projectFileListData = localStorage.getItem('dataManifestGenerator')
      if (!projectFileListData) {
        return false
      }
      
      projectFileListData = JSON.parse(projectFileListData)
      for (let key in projectFileListData) {
        this[key] = projectFileListData[key]
      }
    },
    dataSave () {
      if (this.inited === false) {
        return false
      }
      
      let keys = [
        'name',
        'short_name',
        'background_color',
        'theme_color',
        'description',
        'iconsPath',
      ]
      
      let data = {}
      keys.forEach(key => {
        data[key] = this[key]
      })
      
      data = JSON.stringify(data)
      localStorage.setItem('dataManifestGenerator', data)
    },
    copyManifestJSON () {
      ClipboardUtils.copyPlainString(this.manifestJSON)
      this.copiedManifestJSON = true
    },
    saveManifestJSON () {
      FileUtils.download('manifest.json', this.manifestJSON)
      this.copiedManifestJSON = true
    },
    copyHeaderHTML () {
      ClipboardUtils.copyPlainString(this.headerHTML)
      this.copiedHeaderHTML = true
    },
    selectThemeColor: async function () {
      let color = await this.$parent.$refs.ColorSelector.selectColor(this.theme_color)
      if (!color) {
        return false
      }
      this.theme_color = color
    },
    selectBackgroundColor: async function () {
      let color = await this.$parent.$refs.ColorSelector.selectColor(this.background_color)
      if (!color) {
        return false
      }
      this.background_color = color
    },
    searchFavicon () {
      //console.log('aaa')
      
      let urlList = [
        `https://www.iconninja.com/tag/${this.searchFaviconQuery}-icon`,
        `https://findicons.com/search/${this.searchFaviconQuery}`,
        `https://www.flaticon.com/search?word=${this.searchFaviconQuery}&search-type=icons&license=selection&order_by=4&grid=small`
      ].forEach(url => {
        shell.openExternal(url)
      })
    }
  }
}