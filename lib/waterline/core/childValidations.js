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
  var self = this;
  var errors = {};
  //if true, defaults not already created ,creating it
  if (!this.defaults) {
    this.defaults = {};
    if(this.criteria){
      _.keys(this.criteria).forEach(function (key) {
        if (!self.context.waterline.collections[self.collectionName]._attributes[key]) return;
        if (_.isObject(self.criteria[key])) return;
        self.defaults[key] = self.criteria[key];
      });
    }
  }
  values = _.defaults(values, this.defaults); 
  
  var result = waterlineCriteria([values],{where : this.criteria ? this.criteria.where : undefined}).results[0];
  if(!result){
    errors.Criteria = [{rule : 'associationCriteria', 
        message : 'Child objects :\n'+require('util').inspect(values)+' do not respect criteria specified in the collection.'}];
    return cb(errors);
  }
  //calling model validation after validating association criteria
  this.context.waterline.collections[this.collectionName]._validator.validate(values, presentOnly, cb);
};

