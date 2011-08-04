var Rollout = require('../lib/rollout.js');
var SimpleBackend = require('../lib/simple_backend.js');
describe("Rollout", function() {
  var rollout;
  beforeEach(function() { 
    var backend = new SimpleBackend;
    rollout = new Rollout(backend); 
  });

  describe("when a group is activated", function() {
    beforeEach(function() {
      rollout.defineGroup('fivesonly', function(user) { return user.id == 5 });
      rollout.activateGroup('chat', 'fivesonly');
    });

    it("the feature is active for users for which the block evaluates to true", function() {
      expect(rollout.isActive('chat', {id: 5})).toBe(true);
    });

    it("is not active for users for which the block evaluates to false", function() {
      expect(rollout.isActive('chat', {id: 1})).toBe(false)
    });

    it("is not active if a group is found in Redis but not defined in Rollout", function() {
      rollout.activateGroup('chat', 'fake')
      expect(rollout.isActive('chat', {id: 1})).toBe(false)
    });
  });

  describe("the default all group", function() {
    beforeEach(function() { rollout.activateGroup('chat', 'all') });

    it("evaluates to true no matter what", function() {
      expect(rollout.isActive('chat', {id: 0})).toBe(true);
    });
  });

  describe("deactivating a group", function() {
    beforeEach(function() {
      rollout.defineGroup('fivesonly', function(user) { return user.id == 5 });
      rollout.activateGroup('chat', 'all');
      rollout.activateGroup('chat', 'fivesonly');
      rollout.deactivateGroup('chat', 'all');
    });

    it("deactivates the rules for that group", function() {
      expect(rollout.isActive('chat', {id: 10})).toBe(false);
    });

    it("leaves the other groups active", function() {
      expect(rollout.isActive('chat', {id: 5})).toBe(true);
    });
  });

  describe("deactivating a feature completely", function() {
    beforeEach(function() {
      rollout.defineGroup('fivesonly', function(user) { return user.id == 5 });
      rollout.activateGroup('chat', 'all');
      rollout.activateGroup('chat', 'fivesonly');
      rollout.activateUser('chat', {id: 51});
      rollout.activatePercentage('chat', 100);
      rollout.deactivateAll('chat');
    });

    it("removes all of the groups", function() {
      expect(rollout.isActive('chat', {id: 0})).toBe(false);
    });

    it("removes all of the users", function() {
      expect(rollout.isActive('chat', {id: 51})).toBe(false);
    });

    it("removes the percentage", function() {
      expect(rollout.isActive('chat', {id: 25})).toBe(false);
    });
  });

  describe("activating a specific user", function() {
    beforeEach(function() {
      rollout.activateUser('chat', {id: 42});
    });

    it("is active for that user", function() {
      expect(rollout.isActive('chat', {id: 42})).toBe(true);
    });

    it("remains inactive for other users", function() {
      expect(rollout.isActive('chat', {id: 24})).toBe(false);
    });
  });

  describe("deactivating a specific user", function() {
    beforeEach(function() {
      rollout.activateUser('chat', {id: 42});
      rollout.activateUser('chat', {id: 24});
      rollout.deactivateUser('chat', {id: 42});
    });

    it("that user should no longer be active", function() {
      expect(rollout.isActive('chat', {id: 42})).toBe(false);
    });

    it("remains active for other active users", function() {
      expect(rollout.isActive('chat', {id: 24})).toBe(true);
    });
  });

  describe("activating a feature for a percentage of users", function() {
    beforeEach(function() {
      rollout.activatePercentage('chat', 20)
    });

    it("activates the feature for that percentage of the users", function() {
      var activeCount = 0;
      for (var id = 1 ; id <= 120; id++) {
        if (rollout.isActive('chat', {id: id})) { activeCount++; }
      }
      expect(activeCount).toEqual(39);
    });
  });

  describe("activating a feature for a percentage of users", function() {
    beforeEach(function() {
      rollout.activatePercentage('chat', 20)
    });

    it("activates the feature for that percentage of the users", function() {
      var activeCount = 0;
      for (var id = 1 ; id <= 200; id++) {
        if (rollout.isActive('chat', {id: id})) { activeCount++; }
      }
      expect(activeCount).toEqual(40);
    });
  });

  describe("activating a feature for a percentage of users", function() {
    beforeEach(function() {
      rollout.activatePercentage('chat', 5)
    });

    it("activates the feature for that percentage of the users", function() {
      var activeCount = 0;
      for (var id = 1 ; id <= 100; id++) {
        if (rollout.isActive('chat', {id: id})) { activeCount++; }
      }
      expect(activeCount).toEqual(5);
    });
  });


  describe("deactivating the percentage of users", function() {
    beforeEach(function() {
      rollout.activatePercentage('chat', 100)
      rollout.deactivatePercentage('chat')
    });

    it("becomes inactivate for all users", function() {
      expect(rollout.isActive('chat', {id: 24})).toBe(false);
    });
  });
});