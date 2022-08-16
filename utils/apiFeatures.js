const APIFeatures = {
  filter: (queryObj, Model) => {
    const replacedQueryObj = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (matched) => `$${matched}`
      )
    );

    return Model.find(replacedQueryObj);
  },
  sort: (sort, query) => {
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      return query.sort(sortBy);
    }

    return query.sort('_id');
  },
  limitFields: (fields, query) => {
    if (fields) {
      const selectedFields = fields.split(',').join(' ');
      console.log(selectedFields);

      return query.select(selectedFields);
    }

    return query.select('-__v');
  },
  paginate: (page, limit, query) => {
    const currentPage = +page || 1;
    const currentLimit = +limit || 5;
    const skip = (currentPage - 1) * currentLimit;

    return query.skip(skip).limit(currentLimit);
  },
};

module.exports = APIFeatures;
