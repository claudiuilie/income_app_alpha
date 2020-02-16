const webtorrent = require('webtorrent')

class WebTorrent {

    
    constructor(magnetURI){
        this.torrent = magnetURI;

    }
    
    downloadTorrent = () => {

       function prettyBytes(num){
            var exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            if (neg) num = -num
            if (num < 1) return (neg ? '-' : '') + num + ' B'
            exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
            num = Number((num / Math.pow(1000, exponent)).toFixed(2))
            unit = units[exponent]
            return (neg ? '-' : '') + num + ' ' + unit
        }

        console.log(this.torrent)
        let client = new webtorrent()

        client.add(this.torrent, { path: '/temp/' }, function (torrent) {
  
            let interval = setInterval(function () {
              console.log(prettyBytes(torrent.downloadSpeed) + '/s')
              console.log('Progress: ' + (torrent.progress * 100).toFixed(1) + '%')
              console.log('NumPeers: '+ torrent.numPeers)
              console.log('Paused: '+torrent.paused)
            }, 2000)
          
            torrent.on('done', function () {
              console.log('torrent download finished')
              clearInterval(interval)
            })
          
            torrent.on('ready', function () {console.log('Ready to use')})
            torrent.on('error', function (err) {console.log(err)})
            // torrent.on('warning', function (err) {console.log(err)})
            torrent.on('noPeers', function (announceType) {console.log('No peers: '+ announceType)})
          })
          
          client.on('error', function (err) {console.log(err)})
    }

}

module.exports = WebTorrent;









