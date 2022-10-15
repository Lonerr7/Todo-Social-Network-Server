const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    // To allow for nested GET comments on tour
    let filterObj = {};
    if (req.params.todoId) {
      filterObj = {
        todo: req.params.todoId,
      };
    }

    // BUILD QUERY
    // 1A) FIltering
    const { page, sort, limit, fields, ...queryObj } = req.query;

    // 1B) Advanced filtering
    let query = APIFeatures.filter(queryObj, Model, filterObj);

    // 2) Sorting (dosent work anything, but numbers)
    query = APIFeatures.sort(sort, query);

    // 3) Field limiting
    query = APIFeatures.limitFields(fields, query);

    // 4) Pagination
    query = APIFeatures.paginate(page, limit, query);

    // EXECUTE QUERY
    const docs = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    req.body.user = req.user.id;

    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return new doc into updatedTodo variable
      runValidators: true,
    });

    console.log(req.body);

    if (!updatedDoc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: updatedDoc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const deletedDoc = await Model.findByIdAndDelete(req.params.id);

    if (!deletedDoc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

const getModelName = (Model) => Model.modelName.toLowerCase();

exports.deleteOneIfOwner = (Model, idField) =>
  catchAsync(async (req, res, next) => {
    const { id: userId } = req.user;
    const { id } = req.params;

    const doc = await Model.findOneAndDelete({
      _id: id,
      [idField]: { _id: userId },
    }).exec();

    if (!doc) {
      next(new AppError(`Invalid ${getModelName(Model)} ID / Forbidden`, 403));
      return;
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

// exports.deleteMany = (Model, idField) =>
//   catchAsync(async (req, res, next) => {
//     const { id } = req.user;

//     const deletedDoc = Model.deleteMany({})
//   });
