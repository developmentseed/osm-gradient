var R = require("ramda");
var turf = require("@turf/helpers");
var createBbox = require("@turf/bbox").default;
var createBboxPolygon = require("@turf/bbox-polygon").default;
var ak = require("id-area-keys");

function ElementParser(json) {
  function createFeature(data) {
    switch (data.type) {
      case "node":
        return createNode(data);
      case "way":
        return createWay(data);
      case "relation":
        return createRelation(data);
    }
  }

  function createNode(data) {
    if (
      Object.keys(data).includes("lat") &&
      Object.keys(data).includes("lon")
    ) {
      var geometry = [data.lon, data.lat].map(parseFloat);
      var properties = R.omit(["lon", "lat"], data);
      return turf.point(geometry, properties);
    }
  }

  function createWay(data) {
    if (!data.nodes) return;
    if (data.nodes && data.nodes.length === 0) {
      return;
    }
    var geometry = data.nodes
      .filter(function (node) {
        return (
          Object.keys(node).includes("lat") && Object.keys(node).includes("lon")
        );
      })
      .map(function (node) {
        return [node.lon, node.lat].map(parseFloat);
      });
    var properties = R.omit(["nodes"], data);

    if (data.tags && ak.isArea(data.tags) && isClosedWay(data.nodes)) {
      return R.omit(["bbox"], turf.polygon([geometry], properties));
    } else {
      return R.omit(["bbox"], turf.lineString(geometry, properties));
    }
  }

  function createRelation(data) {
    if ("members" in data) {
      data.relations = data.members
        .map(createFeature)
        .filter(R.complement(R.isNil)); // filter out nulls
      var feature = createBboxPolygon(
        createBbox(turf.featureCollection(data.relations))
      );
      feature.properties = R.omit(["members"], data);
      return R.omit(["bbox"], feature);
    }
    return null;
  }

  // If the feature was deleted, copy its
  // geometry from the old feature
  if (json.action === "delete") {
    switch (json.type) {
      case "node":
        json.lon = json.old.lon;
        json.lat = json.old.lat;
        break;
      case "way":
        json.nodes = json.old.nodes;
        break;
      case "relation":
        json.members = json.old.members;
        break;
    }
  }

  // Set change type
  switch (json.action) {
    case "create":
      json.changeType = "added";
      break;
    case "delete":
      json.changeType = "deletedNew";
      json.old.changeType = "deletedOld";
      break;
    case "modify":
      json.changeType = "modifiedNew";
      json.old.changeType = "modifiedOld";
      break;
  }

  return ("old" in json ? [R.omit(["old"], json), json.old] : [json]).map(
    createFeature
  );
}

function isClosedWay(nodes) {
  // Each LinearRing of a Polygon must have 4 or more Positions
  if (nodes.length > 3) {
    var firstNode = nodes[0];
    var lastNode = nodes[nodes.length - 1];
    return (
      Object.keys(firstNode).includes("lat") &&
      Object.keys(firstNode).includes("lon") &&
      Object.keys(lastNode).includes("lat") &&
      Object.keys(lastNode).includes("lon") &&
      firstNode.lat === lastNode.lat &&
      firstNode.lon === lastNode.lon
    );
  }
  return false;
}

module.exports = ElementParser;
