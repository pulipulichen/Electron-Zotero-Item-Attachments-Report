
/* global ClipboardUtils, ipcRenderer, ElectronUtils, dayjs, FileUtils, shell */

module.exports = {
  data () {
    
    return {
      cacheKey: 'attachments-reporter',
      cacheAttrs: ['sqlitePath', 'itemID', 'zoteroUserID', 'typeFilterText', 'itemTitle'],
      inited: false,
      
      zoteroUserID: 'pulipuli',
      sqlitePath: 'D:\\OUTTY_DOCUMENT\\Zotero\\zotero.sqlite',
      itemTitle: '',
      itemID: 'LTCUSNNK',
      typeFilterText: '.pdf',
      attachmentRows: []
      
    }
  },
  async mounted () {
    this.dataLoad()
    
    this.inited = true
    //this.queryProjectFileList()
  },
  watch: {
    zoteroUserID () {
      this.dataSave()
    },
    sqlitePath () {
      this.dataSave()
    },
    itemID () {
      this.dataSave()
    },
    typeFilterText () {
      this.dataSave()
    },
    itemTitle () {
      this.dataSave()
    },
  },
  computed: {
    attachmentRowsFiltered () {
      return this.attachmentRows.filter(a => {
        let title = a.title
        
        for (let i = 0; i < this.typeFilter.length; i++) {
          if (title.endsWith(this.typeFilter[i])) {
            return true
          }
        }
        
        return false
      })
    },
    attachmentsText () {
      return this.attachmentRowsFiltered.map(attachment => {
        return [
          attachment.title,
          '',
          attachment.key,
          0,
          '',
          'FALSE',
          attachment.book,
          dayjs().format('M/DD/YYYY hh:mm:ss')
        ].join('\t')
      }).join('\n')
    },
    typeFilter () {
      return this.typeFilterText.trim().split('\n').map(l => l.trim())
    },
    bookKey () {
      let keys = []
      this.attachmentRowsFiltered.map(attachment => {
        if (keys.indexOf(attachment.bookKey) === -1) {
          keys.push(attachment.bookKey)
        }
      })
      
      return keys
    }
  },
  methods: {
    dataLoad () {
      let projectFileListData = localStorage.getItem(this.cacheKey)
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
      
      let keys = this.cacheAttrs
      
      let data = {}
      keys.forEach(key => {
        data[key] = this[key]
      })
      
      data = JSON.stringify(data)
      localStorage.setItem(this.cacheKey, data)
    },
    searchItem () {
      let url = `https://www.zotero.org/${this.zoteroUserID}/search/${this.itemTitle}/titleCreatorYear`
      shell.openExternal(url)
    },
    getAttachments () {
      //console.log('搜尋', this.itemID, this.sqlitePath)
      this.attachmentRows = []
      
      //console.log(this.projectPath)
      
      let callbackID = ElectronUtils.getCallbackID('getAttachments')
      ipcRenderer.on(callbackID, (event, rows) => {
        //console.log(rows)
        if (rows === false) {
          return window.alert('Zotero SQLite Database is busy.')
        }
        
        this.attachmentRows = rows
      });
      ipcRenderer.send('getAttachments', {
        sqlitePath: this.sqlitePath,
        itemID: this.itemID,
        itemTitle: this.itemTitle,
      }, callbackID);
    },
    copyAttachmentsText () {
      ClipboardUtils.copyPlainString(this.attachmentsText)
    },
    openLinks () {
      this.attachmentRowsFiltered.map(row => {
        return `https://drive.google.com/drive/u/0/search?q=type:folder%20` + row.key
      }).forEach(url => {
        shell.openExternal(url)
      })
    }
  }
}