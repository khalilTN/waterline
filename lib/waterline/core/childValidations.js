var _ = require('lodash');
var waterlineCriteria = require('waterline-criteria');

var ChildValidator = module.exports = function(context){
  this.context = context;
};

ChildValidator.prototype.initialize = function(collectionName, criteria){
  this.collectionName = collectionName;
  this.criteria = criteria;
  this.defaults = getDefaults(this.criteria);
};

ChildValidator.prototype.validate = function(values, presentOnly, cb){
  var errors = {};
  //if true, affect default values specified in association criteria to the record to insert if they don't exist
  if(this.defaults){
    values = _.defaults(values, this.defaults);
  }
  var result = waterlineCriteria([values], this.criteria).results[0];
  if(!result){
    errors.Criteria = [{rule : 'associationCriteria', 
        message : 'Child objects :\n'+require('util').inspect(values)+' do not respect criteria specified in the collection.'}];
    return cb(errors);
  }
  //calling model validation after validating association criteria
  this.context.waterline.collections[this.collectionName]._validator.validate(values, presentOnly, cb);
};

var getDefaults = function(criteria){
  if(!criteria || ! criteria.where) return null;
  var defaults = {};
  _.keys(criteria.where).forEach(function(key){
    if(_.isObject(criteria.where[key])) return;
    defaults[key] = criteria.where[key];
  });
  return defaults;
};
