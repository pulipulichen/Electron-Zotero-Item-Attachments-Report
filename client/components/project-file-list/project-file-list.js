
/* global ClipboardUtils, ipcRenderer, ElectronUtils, dayjs, FileUtils */

module.exports = {
  data () {
    let excludePatternsText = `node_modules/**/*
nbproject/**/*
bin/**/*
**/*.md
**/*.map
**/LICENSE
**/package.json
**/package-lock.json
**/browserconfig.xml
\[*/**/*
**/.*
**/*.manifest`
    
    return {
      projectPath: 'D:\\xampp\\htdocs\\projects-html5\\HTML5-Wrapped-Text-Formatter',
      excludePatternsText: excludePatternsText,
      defaultExcludePatternsText: excludePatternsText,
      fileList: [],
      copied: false,
      inited: false
//      prefixText: `\t'`,
//      suffixText: `',`,
    }
  },
  async mounted () {
    this.dataLoad()
    
    this.inited = true
    //this.queryProjectFileList()
  },
  watch: {
    projectPath () {
      this.dataSave()
    },
    excludePatternsText () {
      this.dataSave()
    }
  },
  computed: {
    excludePatterns () {
      return this.excludePatternsText.trim().split('\n').map(line => line.trim())
    },
    fileListText () {
      return this.fileList.join('\n')
    },
    serviceWorkerCode () {
      let template = `/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* global self, caches */

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v${dayjs().format('YYYY-MMDD-hhmmss')}';
const RUNTIME = 'runtime';

/**
 * How to build cache list?
 * 
 * 1. FilelistCreator 
 * 2. String replace
 */

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  '${this.fileList.join(`',\n  '`)}'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});`
      return template
    },
  },
  methods: {
    dataLoad () {
      let projectFileListData = localStorage.getItem('projectFileListData')
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
        'projectPath',
        'excludePatternsText',
      ]
      
      let data = {}
      keys.forEach(key => {
        data[key] = this[key]
      })
      
      data = JSON.stringify(data)
      localStorage.setItem('projectFileListData', data)
    },
    queryProjectFileList () {
      
      //console.log(this.projectPath)
      
      let callbackID = ElectronUtils.getCallbackID('queryProjectFileList')
      ipcRenderer.on(callbackID, (event, content) => {
        //this.fileList = content.map(line => {
        //  return this.prefixText + line + this.suffixText
        //}).join('\n')
        
        this.fileList = content
        
        if (content.length > 0) {
          this.copied = true
          this.$refs.CopyButton.focus()
        }
        else {
          this.copied = false
        }
      });
      ipcRenderer.send('queryProjectFileList', {
        projectPath: this.projectPath,
        excludePatterns: this.excludePatterns,
      }, callbackID);
      
      //return 'ok'
    },
    copyFileList () {
      ClipboardUtils.copyPlainString(this.fileListText)
      this.copied = false
    },
    resetExcludePatternsText () {
      this.excludePatternsText = this.defaultExcludePatternsText
    },
    copyServiceWorkerCode () {
      ClipboardUtils.copyPlainString(this.serviceWorkerCode)
      this.copied = false
    },
    saveServiceWorkerCode () {
      FileUtils.download('service-worker.js', this.serviceWorkerCode)
      this.copied = false
    },
    copyLoaderSrcCode () {
      ClipboardUtils.copyPlainString(`<script src="./scripts/service-worker-loader.js"></script>`)
    }
  }
}