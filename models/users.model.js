// here is a modele for omegabot users
// this is a mongoose model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const createModel = async (fields, modelName) => {
  const schemaFields = {
    ...fields,
    id: {
        type: String,
        required: true,
        unique: true
    }
  };

  const schema = new Schema(schemaFields);

  schema.statics.createModel = async function (object) {
    const model = new this({
      id: object.id,
    });
    return await model.save();
  };

  schema.statics.ping = async function () {
    const start = Date.now();
    await this.findOne({ id: "1" });
    return Date.now() - start;    
  };

  const Model = mongoose.model(modelName, schema);

  return Model;
};

module.exports = createModel;