var _ = require('lodash');
var waterlineCriteria = require('waterline-criteria');

var ChildValidator = module.exports = function(context){
  this.context = context;
};

ChildValidator.prototype.initialize = function(collectionName, criteria){
  this.collectionName = collectionName;
  this.criteria = criteria;
};

ChildValidator.prototype.validate = function(values, presentOnly, cb){
  var errors = {};console.log('~~~',values,require('util').inspect(this.criteria,{depth : null, colors : true}));
  var result = waterlineCriteria([values], this.criteria).results[0];
  if(!result){
    errors.Criteria = [{message : 'Child objects :\n'+require('util').inspect(values)+' do not respect criteria specified in the collection.'}];
    return cb(errors);
  }
  this.context.waterline.collections[this.collectionName]._validator.validate(values, presentOnly, cb);
};

