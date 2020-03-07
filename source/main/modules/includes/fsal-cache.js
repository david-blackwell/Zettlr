/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        FSALCache class
 * CVM-Role:        Model
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     This is a simple cache class
 *                  that slows down the initial loading of files
 *                  a little bit, but then makes up for it by
 *                  speeding up the boot time of Zettlr between
 *                  25 percent and over 90 percent by enabling us
 *                  to read in a small amount of cache files. Tests
 *                  with approx. 6.000 files have shown that roughly
 *                  100 cache files result which enable above-mentioned
 *                  performance-gains.
 *
 * END HEADER
 */

const fs = require('fs')
const path = require('path')

module.exports = class FSALCache {
  constructor (datadir) {
    this._datadir = datadir
    this._data = {}

    try {
      fs.lstatSync(this._datadir)
    } catch (e) {
      // Make sure the path exists
      fs.mkdirSync(this._datadir, { 'recursive': true })
    }
  }

  /**
   * Returns the value associated for a key without removing it.
   * @param {String} key The key to get
   */
  get (key) {
    if (!this._hasShard(key)) this._loadShard(key)
    return this._data[this._determineShard(key)][key]
  }

  /**
   * Sets (potentially overwriting) a cache key.
   * @param {String} key The key to set
   * @param {Mixed} value Any JSONable data
   */
  set (key, value) {
    if (!this._hasShard(key)) this._loadShard(key)
    this._data[this._determineShard(key)][key] = value
  }

  /**
   * Removes the given key from the cache.
   * @param {String} key The key to remove
   */
  del (key) {
    if (this.has(key)) delete this._data[this._determineShard(key)][key]
  }

  /**
   * Returns true if the cache has the given key in memory.
   * @param {String} key The key to be searched
   */
  has (key) {
    if (!this._hasShard(key)) this._loadShard(key)
    return this._data[this._determineShard(key)].hasOwnProperty(key)
  }

  /**
   * Returns the value of key and removes the entry from the cache.
   * @param {String} key The key to pluck
   */
  pluck (key) {
    let val = JSON.parse(JSON.stringify(this.get(key)))
    this.del(key)
    return val
  }

  /**
   * Persist all cache data on disk.
   */
  persist () {
    // Saves all currently loaded shards to disk
    for (let shard of Object.keys(this._data)) {
      try {
        fs.writeFileSync(path.join(this._datadir, shard), JSON.stringify(this._data[shard]))
      } catch (e) {
        global.log.error(`Could not save shard ${shard} on disk!`, e)
      }
    }
  }

  /**
   * Lazily loads the shard for the given key.
   * @param {String} key The key for which the shard should be loaded
   */
  _loadShard (key) {
    // load a shard
    let shard = this._determineShard(key)

    try {
      fs.lstatSync(path.join(this._datadir, shard))
      let content = fs.readFileSync(path.join(this._datadir, shard), { encoding: 'utf8' })
      this._data[shard] = JSON.parse(content)
    } catch (err) {
      this._data[shard] = {}
    }
  }

  /**
   * Returns true if the given shard has already been loaded.
   * @param {String} key The key to query a shard for
   */
  _hasShard (key) {
    return this._data.hasOwnProperty(this._determineShard(key))
  }

  /**
   * Algorithm to determine where to save the given key.
   * @param {String} key The key for which the shard should be determined
   */
  _determineShard (key) {
    // Here's the algorithm for choosing the shard:
    // Based off the first two characters of the key
    // whoooooooooooooo. Well, but the keys will only
    // be hashes, so whatever lol. Nothing fancy as
    // Instagram does (cf. https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c)

    let shard = key
    if (typeof shard !== 'string') shard = key.toString()
    return shard.substr(0, 2)
  }
}
