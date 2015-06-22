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
  var errors = {};
  //if true, defautls not already created ,creating it
  if(this.criteria && !this.defaults){
    this.defaults = getDefaults(this.criteria, this.context.waterline.collections[this.collectionName]._attributes);
  }
  values = _.defaults(values, this.defaults); 
  
  var result = waterlineCriteria([values], this.criteria).results[0];
  if(!result){
    errors.Criteria = [{rule : 'associationCriteria', 
        message : 'Child objects :\n'+require('util').inspect(values)+' do not respect criteria specified in the collection.'}];
    return cb(errors);
  }
  //calling model validation after validating association criteria
  this.context.waterline.collections[this.collectionName]._validator.validate(values, presentOnly, cb);
};

var getDefaults = function(criteria, attrs){
  if(!criteria) return {};
  var defaults = {};
  _.keys(criteria).forEach(function(key){
    if(!attrs[key]) return;
    if(_.isObject(criteria[key])) return;
    defaults[key] = criteria[key];
  });
  return defaults;
};
