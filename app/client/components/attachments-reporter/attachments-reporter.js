/* global ClipboardUtils, ipcRenderer, ElectronUtils, dayjs, FileUtils, shell */

module.exports = {
  data () {
    
    return {
      cacheKey: 'attachments-reporter',
      cacheAttrs: ['sqlitePath', 'itemID', 'tag', 'zoteroUserID', 'typeFilterText', 'itemTitle', 'spreadsheetURL', 'zoteroURL', 'zoteroAddedTag'],
      inited: false,
      
      zoteroUserID: '',
      sqlitePath: '/data/zotero.sqlite',
      spreadsheetURL: '',
      zoteroURL: '',
      itemTitle: '',
      itemID: '',
      typeFilterText: `.pdf
.epub
.mobi
.chm
.xps
.djvu
.cbz
.cbr`,
      attachmentRows: [],
      tag: '',
      
      isLoading: false,
      coverURL: '',
      
      zoteroAddedTag: 'ToReadListAdded',
      attachmentsText: ``
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
    spreadsheetURL () {
      this.dataSave()
    },
    zoteroURL () {
      this.dataSave()
    },
    tag () {
      this.dataSave()
    },
    zoteroAddedTag () {
      this.dataSave()
    },
    attachmentRows () {
      this.setAttachmentsText()
    }
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
    bookTitle () {
      if (this.attachmentRowsFiltered.length === 0) {
        return ''
      }
      else {
        let title = this.attachmentRowsFiltered[0].book.trim()
        if (title.indexOf('=') > -1) {
          title = title.slice(0, title.indexOf('=')).trim()
        }
        if (title.indexOf(' by ') > -1 && title.length > 10) {
          title = title.slice(0, title.indexOf(' by ')).trim()
        }
        return title
      }
    },
    bookText () {
      return [
          this.bookTitle,
          this.coverThumbnail,
          this.tag,
          this.itemID,
          '',
          dayjs().subtract(7, 'day').format('M/DD/YYYY hh:mm:ss')
        ].join('\t')
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
    },
    isOpenSpreadsheetDisabled () {
      return (this.spreadsheetURL === '' 
              || !this.spreadsheetURL.startsWith('https://docs.google.com/spreadsheets/d/'))
    },
    isOpenZoteroDisabled () {
      return (this.zoteroURL === '' 
              || !this.zoteroURL.startsWith('https://www.zotero.org/'))
    },
    isCopyCoverThumbnailDisabled () {
      return (this.coverURL === '')
    },
    coverThumbnail () {
      if (this.isCopyCoverThumbnailDisabled) {
        return ''
      }
      if (this.coverURL.startsWith('https://drive.google.com/file/d/')) {
        let fileID = this.coverURL.split('/')[5]
        let url = `https://drive.google.com/thumbnail?id=${fileID}&sz=w1600-h1600`
        return url
      }
      else {
        return this.coverURL.trim()
      }
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
        if (rows === false || Array.isArray(rows) === false) {
          this.isLoading = false
          return window.alert('Zotero SQLite Database is busy: ' + rows)
        }
        
        if (rows.length === 0) {
          this.isLoading = false
          return window.alert('Not found')
        }
        
        rows.sort((a, b) => {
          let aMatches = a.title.match(/\d+/)
          let bMatches = b.title.match(/\d+/)

          if (!aMatches || !bMatches) {
            return a.title.localeCompare(b.title)
          }
          
          for (let i = 0; i < aMatches.length; i++) {

            if (!aMatches[i] || !bMatches[i]) {
              return a.title.localeCompare(b.title)
            }

            let aID = Number(aMatches[i])
            let bID = Number(bMatches[i])

            if (aID !== bID) {
              return (aID - bID)
            }
          }
        })

        this.attachmentRows = this.attachmentRows.slice(0,0).concat(rows)
        this.isLoading = false
        this.coverURL = ''
        
        if (this.bookKey[0] && this.itemID === '') {
          this.itemID = this.bookKey[0]
        }
        
        setTimeout(() => {
          // this.setAttachmentsText()
          this.$refs.CopyAttachmentsTextButton.scrollIntoView()
          this.$refs.CopyAttachmentsTextButton.focus()
          this.isLoading = false
        }, 0)
      })
      
      this.isLoading = true
      ipcRenderer.send('getAttachments', {
        sqlitePath: this.sqlitePath,
        itemID: this.itemID,
        itemTitle: this.itemTitle,
      }, callbackID);
    },
    copyAttachmentsText () {
      ClipboardUtils.copyPlainString(this.attachmentsText)
    },
    copyBookText () {
      ClipboardUtils.copyPlainString(this.bookText)
    },
    copyZoteroAddedTag () {
      ClipboardUtils.copyPlainString(this.zoteroAddedTag)
    },
    openLinks () {
      this.attachmentRowsFiltered.map(row => {
        return `https://drive.google.com/drive/u/0/search?zotero=true&q=type:folder%20` + row.key
      }).forEach(url => {
        shell.openExternal(url)
      })
    },
    openSearchCover () {
      // https://www.google.com/search?q=JavaScript+%E7%BC%96%E7%A8%8B%E7%B2%BE%E8%A7%A3
      let url = 'https://www.google.com/search?q=' + encodeURIComponent(this.bookTitle) + '&sxsrf=ALeKk00pGeE5eDj08uTpzRjZNVhcByrW_w:1612533809783&source=lnms&tbm=isch&sa=X&ved=2ahUKEwjhjK7H9NLuAhXlyosBHZXSAWgQ_AUoAnoECAYQBA&biw=931&bih=568'
      shell.openExternal(url)
    },
    openSpreadsheetURL () {
      shell.openExternal(this.spreadsheetURL)
    },
    openZoteroURL () {
      shell.openExternal(this.zoteroURL)
    },
    copyCoverThumbnail () {
      // https://drive.google.com/file/d/1XfMjPCu1srYdlOYY9NbFIZMONETavBJm/view?usp=sharing
      //let url = this.coverURL
      
      let fileID = this.coverURL.split('/')[5]
      let url = `https://drive.google.com/thumbnail?id=${fileID}&sz=w1600-h1600`
      // https://drive.google.com/thumbnail?id=1XfMjPCu1srYdlOYY9NbFIZMONETavBJm&sz=w1600-h1600
      
      
      ClipboardUtils.copyPlainString(url)
    },
    copyList () {
      let output = []

      output.push(this.attachmentsText)
      output.push('====')
      output.push(this.bookText)

      ClipboardUtils.copyPlainString(output.join('\n'))
    },
    copyColabURL () {
      ClipboardUtils.copyPlainString('https://colab.research.google.com/drive/1iQ3tL4OG9F9fMfGLY2V4G7SHAfE6Ehci?usp=sharing')
    },
    downloadList () {
      const filename = 'test.txt';
      const content = 'hello world';
      this.downloadFile(filename, content);
    },
    downloadFile(filename, content) {
      // Create a blob with the content
      const blob = new Blob([content], { type: 'text/plain' });
    
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);
    
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
    
      // Simulate a click on the link to trigger the download
      link.click();
    
      // Clean up the temporary URL
      URL.revokeObjectURL(url);
    },

    async setAttachmentsText () {
      let output = []
      for (let i = 0; i < this.attachmentRowsFiltered.length; i++) {
        let attachment = this.attachmentRowsFiltered[i]
        output.push([
          attachment.title,
          '',
          attachment.key,
          0,
          '',
          'FALSE',
          this.bookTitle,
          dayjs().subtract(7, 'day').format('M/DD/YYYY hh:mm:ss'),
          '',
          await this.getAttachmentPages(attachment)
        ].join('\t'))
      }
      this.attachmentsText = output.join('\n')
      // LangChain入门指南：构建高可复用、可扩展的LLM应用程序

    },
    
    async getAttachmentPages (attachment) {
      if (attachment.title.endsWith('.pdf') === false) {
        return ''
      }

      let callbackID = ElectronUtils.getCallbackID('getAttachmentPages')
      
      return new Promise((resolve, reject) => {
        ipcRenderer.on(callbackID, (event, pages) => {
          resolve(pages)
        })

        ipcRenderer.send('getAttachmentPages', {
          title: attachment.title,
          key: attachment.key
        }, callbackID);
      })
    }

  }
}