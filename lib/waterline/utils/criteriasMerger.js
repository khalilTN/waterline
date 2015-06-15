var _ = require('lodash');

var merge = module.exports = function(defaultCriteria, criteria){
  var userCriteria = _.cloneDeep(criteria);
  criteria = _.merge({}, defaultCriteria, userCriteria);
  //merging  the sort with _.defaults(), to ensure that userCriteria sort keys have more priority in order, and they should override same keys in the default sort
  criteria.sort = _.defaults({}, userCriteria.sort, defaultCriteria.sort);
  //override "or" clause
  if(userCriteria.where && userCriteria.where.or){
    criteria.where.or = userCriteria.where.or;
  }
  else if(!userCriteria.where){
    criteria.where = defaultCriteria.where;
  }
  //overriding select
  if(userCriteria.select){
    criteria.select = userCriteria.select;
  }
  return criteria;
  
};




