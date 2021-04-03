// load needed modules
const Property = require("../db/models/property");

// function to create new property
const createProperty = (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({
      status: 'fail',
      message: 'Data sent is not correct',
      data: null
    });
  }

  const property = new Property(body);

  if (!property) {
    return res.status(400).json({
      status: 'fail',
      message: 'Cannot create new property',
      data: null
    });
  }

  property
    .save()
    .then(() => {
      return res.status(201).json({
        status: 'success',
        message: 'New property created successfully',
        data: property
      });
    })
    .catch(error => {
      return res.status(400).json({
        status: 'error',
        message: 'Property not created',
        data: { errorCode: error }
      });
    });
}

// function to delete existing property
const deleteAllProperties = async (req, res) => {
  const data = await Property.remove();
  const count = data.deletedCount;

  return res.status(200).json({
    status: 'success',
    message: 'All data has been removed',
    data: count
  });
}

// export functions
module.exports = {
  createProperty,
  deleteAllProperties
}