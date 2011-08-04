module.exports = function() {
  this.store = {};

  this.sadd = function(key, value) {
    this.store[key] = this.store[key] || [];
    this.store[key].push(value);
  };

  this.srem = function(key, value) {
    this.store[key] = this.store[key] || [];
    for (var i = 0; i < this.store[key].length ; i++) {
      if (this.store[key][i] === value) {
        this.store[key][i] = null;
      }
    }
  };

  this.smembers = function(key) {
    return this.store[key];
  };

  this.sismember = function(key, value) {
    if (!this.store[key]) { return false; }
    for(var i = 0; i < this.store[key].length; i++) {
      if (this.store[key][i] === value) { return true; }
    }
    return false;
  };

  this.set = function(key, value) {
    this.store[key] = value;
  };

  this.del = function(key) {
    this.store[key] = null;
  };

  this.get = function(key) {
    return this.store[key];
  };



}