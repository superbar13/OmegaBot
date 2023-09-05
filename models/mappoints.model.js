// here is a modele for omegabot map
// this is a mongoose model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MapPointSchema = new Schema({
    x: {
        type: String,
        required: true,
    },
    z: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: false,
    },
    icon: {
        type: String,
        required: false,
    },
});

// unique with index position
MapPointSchema.index({ x: 1, z: 1 }, { unique: true });

MapPointSchema.statics.createModel = async function (object) {
	const mapPoint = new MapPoint({
		x: object.x,
        z: object.z,
        type: object.type,
        name: object.name,
        owner: object.owner,
        width: object.width,
        height: object.height,
        color: object.color ? object.color : undefined,
        icon: object.icon ? object.icon : undefined,
	});
	return await mapPoint.save();
}

MapPointSchema.statics.AddPointToMap = async function (object) {
    // check a point already exists at this position
    let point = await MapPoint.findPoint(object.x, object.z); // find the point
    // if point update it to replace it
    if(point) {
        await MapPoint.updateOne({ _id: point._id }, object); // update the point
        return true;
    } else {
        await MapPoint.createModel(object); // create the point
        return true;
    }
}

MapPointSchema.statics.FindPoint = async function (x, z) {
    // check a point already exists at this position
    // the point position is an zone of width and height around the point position
    // we find arrond the point position and not around our coordinates
    let points = await MapPoint.find();
    points.filter(p => 
        p.x >= x - p.width // $gte = greater than or equal with width x
        && p.x <= x + p.width // $lte = lower than or equal with width x
        && p.z >= z - p.height // $gte = greater than or equal with height z
        && p.z <= z + p.height // $lte = lower than or equal with height z
    );
    if(points.length == 0) return false // if no points found
    else return points[0]; // return the first point found
}

MapPointSchema.statics.RemovePointFromMap = async function (x, z) {
    // check a point already exists at this position
    let point = await MapPoint.findPoint(x, z);
    // if point update it to replace it
    if(point) {
        await MapPoint.deleteOne({ _id: point._id });
        return true;
    } else return false;
}

MapPointSchema.statics.GetPointsInZone = async function (xMin, xMax, zMin, zMax) {
    let Points = await MapPoint.find({
        x: {
            $gte: xMin, $lte: xMax
        },
        z: {
            $gte: zMin, $lte: zMax
        }
    }); // We find Points in the zone
    return Points; // Here is an array of points
}

MapPointSchema.statics.ping = async function () {
	let time = Date.now();
	await Interserver.findOne({ id: "1" });
	return Date.now() - time;
}

const MapPoint = mongoose.model('mappoint', MapPointSchema);

module.exports = MapPoint;
