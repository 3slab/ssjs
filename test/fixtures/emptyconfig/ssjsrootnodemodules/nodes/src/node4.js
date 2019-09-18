"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("../../../../src/node");
const utils_1 = require("../../../../src/utils");
class FourNode extends node_1.Node {
  constructor(config = {}, logger = utils_1.logger) {
    super({}, config, logger);
  }
}
FourNode.type = 'four';
exports.FourNode = FourNode;
