'use strict';

var globby = require('globby');
var path = require('path');
var protobuf = require('protobufjs');

let COMMON_PROTO_FILES;

class GoogleProtoFilesRoot extends protobuf.Root {
  constructor() {
    super([].slice.apply(arguments));
  }

  // Caches and returns an array of the local common/google core proto files
  // exist on disk.
  static getCommonProtoFiles() {
    var commonProtoDirs = [
      // This list of directories is defined here:
      // https://github.com/googleapis/googleapis/blob/master/gapic/packaging/common_protos.yaml
      'api',
      path.join('logging', 'type'),
      'longrunning',
      'protobuf', // This is an additional path that the common protos depend on.
      'rpc',
      'type',
    ];

    var commonProtoGlobPatterns = commonProtoDirs.map(dir =>
      path.join(__dirname, 'google', dir, '**', '*.proto')
    );

    if (!COMMON_PROTO_FILES) {
      COMMON_PROTO_FILES = globby
        .sync(commonProtoGlobPatterns)
        .map(path.normalize);
    }

    return COMMON_PROTO_FILES;
  }

  // Causes the loading of an included proto to check if it is a common
  // proto. If it is a common proto, use the google-proto-files proto.
  resolvePath(_, includePath) {
    includePath = path.normalize(includePath);

    // Fully qualified paths don't need to be resolved.
    if (path.isAbsolute(includePath)) {
      return includePath;
    }

    const fullIncludePath = path.join(
      __dirname,
      path.relative(__dirname, includePath)
    );
    const commonProtoFiles = GoogleProtoFilesRoot.getCommonProtoFiles();

    if (commonProtoFiles.indexOf(fullIncludePath) > -1) {
      return fullIncludePath;
    }

    return protobuf.util.path.resolve.apply(null, [].slice.call(arguments));
  }
}

module.exports.loadSync = function(filename, options) {
  const root = new GoogleProtoFilesRoot();
  return root.loadSync(filename, options);
};

module.exports.load = function(filename, options) {
  const root = new GoogleProtoFilesRoot();
  return root.load(filename, options);
};

module.exports.GoogleProtoFilesRoot = GoogleProtoFilesRoot;
