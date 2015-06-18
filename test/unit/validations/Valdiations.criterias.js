var Waterline = require('../../../lib/waterline'),
        assert = require('assert'),
        async = require('async'),
        WLValidationError = require('../../../lib/waterline/error/WLValidationError');

var waterline = new Waterline();
var migrate = 'drop';

describe('Populate Deep', function () {
  var SheepModel, PersonModel, CloverModel;
  before(function (done) {
    
    var Person = Waterline.Collection.extend({
      identity: 'Person',
      connection: 'pop_deep',
      tableName: 'person_table',
      migrate: migrate,
      attributes: {
        "personId": {
          "type": "integer",
          "primaryKey": true
        },
        "personName": {
          "type": "string"
        },
        sheeps : {
          "collection": "Sheep",
          "via": "person",
          "criteria":{
            where : {sheepAge : {'<=' : 2}}
          }
        }
      }
    });
    
    var Sheep = Waterline.Collection.extend({
      identity: 'Sheep',
      connection: 'pop_deep',
      tableName: 'sheep_table',
      migrate: migrate,
      criteria : {
        where : {legsNumber : 4}
      },
      attributes: {
        "sheeplId": {
          "type": "integer",
          "primaryKey": true
        },
        "sheepColor": {
          "type": "string"
        },
        "legsNumber" : {
          "type" : "integer"
        },
        person : {
          "model" : "person"
        },
        sheepAge : {
          "type" : "integer"
        }
      }
    });
    
    var Plant = Waterline.Collection.extend({
      identity: 'Plant',
      connection: 'pop_deep',
      tableName: 'plant_table',
      migrate: migrate,
      attributes: {
        "plantId": {
          "type": "integer",
          "primaryKey": true
        },
        "plantName": {
          "type": "string"
        },
        leafNumber : {
          "type": "integer"
        }
      }
    });
    
    var Clover = Waterline.Collection.extend({
      identity: 'Clover',
      connection: 'pop_deep',
      tableName: 'plant_table',
      migrate: migrate,
      criteria : {
        "where" : {"leafNumber" : 3}
      },
      attributes: {
        "plantId": {
          "type": "integer",
          "primaryKey": true
        },
        "plantName": {
          "type": "string"
        },
        leafNumber : {
          "type": "integer"
        }
      }
    });

    waterline.loadCollection(Sheep);
    waterline.loadCollection(Person);
    waterline.loadCollection(Clover);
    waterline.loadCollection(Plant);

    var connections = {'pop_deep': {
        adapter: 'adapter'}
    };

    waterline.initialize({adapters: {adapter: require('sails-memory')}, connections: connections}, function (err, colls) {
      PersonModel = colls.collections.person;
      SheepModel = colls.collections.sheep;
      CloverModel = colls.collections.clover;
      done();
    });
  });

  it('should not create a child record that does not respect model defined criteria', function (done) {
    var marySheeps = [{sheepId : 1, sheepColor : 'Black', legsNumber : 4, sheepAge : 2},
      {sheepId : 2, sheepColor : 'Cyan', legsNumber : 3, sheepAge : 1}];
    PersonModel.create({personId : 1, personName : 'Mary', sheeps : marySheeps}, function (err) {
      assert(err, 'An error should be returned');
      assert(err[0].values.legsNumber === 3, 'Error should contains the non valid child record');
      done();
    });
  });
  
  it('should not create a child record that does not respect association defined criteria', function (done) {
    var maxSheeps = [{sheepId : 3, sheepColor : 'Black', legsNumber : 4, sheepAge : 3}, 
      {sheepId : 4, sheepColor : 'White', legsNumber : 4, sheepAge : 1}];
    PersonModel.create({personId : 2, personName : 'Max', sheeps : maxSheeps}, function (err) {
      assert(err, 'An error should be returned');
      assert(err[0].values.sheepAge === 3, 'Error should contains the non valid child record');
      done();
    });
  });
  
 it('should not create a record that does not respect model defined criteria', function (done) {
    CloverModel.create({plantId : 1, plantName : 'clover', leafNumber : 4}).exec(function(err,result){
      assert(err,'An error should be returned');
      done();
    });
 });
 
 it('should populate with children respecting association criteria and user criteria', function (done) {
    var sheeps = [{sheepId : 5, sheepColor : 'Black', legsNumber : 4, sheepAge : 6, person :3}, 
      {sheepId : 6, sheepColor : 'Cyan', legsNumber : 4, sheepAge : 2, person :3},
      {sheepId : 7, sheepColor : 'Black', legsNumber : 4, sheepAge : 1, person :3}];
    SheepModel.createEach(sheeps, function (err) {
      if(err) return done(err);
      PersonModel.create({personId : 3, personName : 'Samir'}).exec(function(err,result){
        PersonModel.findOne(3).populate('sheeps',{where : {sheepColor : 'Black'}}).exec(function(err, person){
          assert(person.sheeps.length === 1, 'Found children should respect the merged criterias');
          assert(person.sheeps[0].sheepColor === 'Black' && person.sheeps[0].sheepAge === 1, 'Found children should respect the merged criterias');
          done();
        });
      });
    });
 });
 
});
