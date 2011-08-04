

module.exports = function(backend) {
  this.store = backend;
  this.groups = {"all": function(user) { return true; }};
  
  this.isActive = function(feature, user) { 
    return this.isUserActive(feature, user) ||
      this.isUserInActiveGroup(feature, user) ||
      this.isUserWithinActivePercentage(feature, user);
  };
  
  this.activateUser = function(feature, user) { 
    this.store.sadd(this.userKey(feature), user.id);
  };
  this.deactivateUser = function(feature, user) { 
    this.store.srem(this.userKey(feature), user.id);
  };

  this.activateGroup = function(feature, group) { 
    this.store.sadd(this.groupKey(feature), group);
  };
  this.deactivateGroup = function(feature, group) { 
    this.store.srem(this.groupKey(feature), group);
  };
  
  this.activatePercentage = function(feature, percentage) {
    this.store.set(this.percentageKey(feature), percentage);
  };
  this.deactivatePercentage = function(feature) {
    this.store.del(this.percentageKey(feature));
  };

  this.deactivateAll = function(feature) {
    this.store.del(this.percentageKey(feature));
    this.store.del(this.userKey(feature));
    this.store.del(this.groupKey(feature));
  };
  
  this.defineGroup = function(group, filter) { 
    this.groups[group] = filter;
  };

  this.groupKey = function(feature) { return feature + ":groups" };
  this.userKey = function(feature) { return feature + ":users" };
  this.percentageKey = function(feature) { return feature + ":percentage" };
  this.key = function(feature) { return "features:" + feature };
  
  this.isUserInActiveGroup = function(feature, user) {
    var groups = this.store.smembers(this.groupKey(feature)) || [];
    for (var i = 0; i < groups.length; i++) {
      var group_filter = this.groups[groups[i]];
      if (group_filter && group_filter(user)) { return true; }
    }
    return false;
  };

  this.isUserActive = function(feature, user) {
    return this.store.sismember(this.userKey(feature), user.id);
  };

  this.isUserWithinActivePercentage = function(feature, user) {
    var percentage = this.store.get(this.percentageKey(feature));
    if (!percentage) { return false };
    return user.id % 100 < percentage;
  };
  
  return this;
}





