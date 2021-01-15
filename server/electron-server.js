/* global __dirname */

const {app, BrowserWindow, dialog, Menu, Tray, globalShortcut, ipcMain, session, shell} = require('electron');
let fs = require('fs');
var path = require('path');
let config = require('../config.js')
const { exec } = require("child_process");

const glob = require('glob');
const globby = require('globby'); 
const globall = require('glob-all'); 

let compareString = function (a, b) {
  if (a < b) {
    return -1;
  }
  if (b < a) {
    return 1;
  }
  return 0;
}

let events = {
  queryProjectFileList: function (event, parameters, _callback_id) {
//
//    if (config.backupDictPath) {
//      fs.writeFileSync(config.backupDictPath, projectPath, 'UTF8');
//    }
    let {projectPath, excludePatterns} = parameters

    if (!fs.existsSync(projectPath) || fs.lstatSync(projectPath).isDirectory() === false) {
      event.sender.send(_callback_id, [])
      return false
    }

    if (!projectPath.endsWith('/')) {
      projectPath = projectPath + '/'
    }
    
//    let excludePatterns = [
//      'node_modules/**/*',
//      'nbproject/**/*',
//      '**/*.md',
//      '**/LICENSE',
//      '**/package.json',
//      '**/*.manifest',
//    ]
    
    let findPatterns = [
      projectPath + '**',
    ]
    
    excludePatterns.forEach(p => {
      findPatterns.push('!' + projectPath + p,)
    })

    var files = globall.sync(findPatterns, {
      nodir: true
    });
    
    for (let i = 0; i < files.length; i++) {
      files[i] = files[i].slice(projectPath.length)
    }
    
    files = files.sort((a, b) => {
      let aParts = a.split('/')
      let bParts = b.split('/')
      
      if (aParts.length === 1 && bParts.length > 1) {
        return -1
      } 
      else if (bParts.length === 1 && aParts.length > 1) {
        return 1
      } 
      else if (bParts.length === 1 && aParts.length === 1) {
        return compareString(a, b)
      } 
      
      for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        let aPartsName = aParts[i]
        let bPartsName = bParts[i]
        
        if (aPartsName < bPartsName) {
          return -1
        }
        if (bPartsName < aPartsName) {
          return 1
        }
        else {
          if (aParts.length < bParts.length) {
            return -1
          } 
          else if (bParts.length < aParts.length) {
            return 1
          } 
          else {
            //return compareString(a, b)
          }
        }
      }
      
      return 0
      /*
      //console.log(a.split('/').length, b.split('/').length)
      if (a.split('/').length > b.split('/').length) {
        return 1
      }
      else if (a.split('/').length < b.split('/').length) {
        return -1
      }
      else {
        if (a < b) {
          return -1;
        }
        if (b < a) {
          return 1;
        }
        return 0;
      }*/
    })
    
    //console.log(files)
    
    event.sender.send(_callback_id, files)
  }
}

module.exports = {
  setup: function () {

    for (let event in events) {
      ipcMain.on(event, events[event])
    }
  },
  
};