var _ = require('lodash');

var merge = module.exports = function(destination, source){
  if(destination){
    var userCriteria = _.cloneDeep(source);
    source = _.merge({}, destination, userCriteria);
    //merging  the sort with _.defaults(), to ensure that userCriteria sort keys have more priority in order, and they should override same keys in the default sort
    source.sort = _.defaults({}, userCriteria.sort, destination.sort);
    //override "or" clause
    if(userCriteria.where && userCriteria.where.or){
      source.where.or = userCriteria.where.or;
    }
    else if(!userCriteria.where){
      source.where = destination.where;
    }
    //overriding select
    if(userCriteria.select){
      source.select = userCriteria.select;
    }
    return source;
  }
  return source;
};