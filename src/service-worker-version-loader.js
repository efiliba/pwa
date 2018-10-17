const { getOptions } = require('loader-utils');

module.exports = function loader(source) {
  const {version} = getOptions(this);
  return source.replace(/(const VERSION\s*=\s*(?<quote>(?:\\")|'|))([^;]*)\k<quote>/, `$1${version}$2`);
}
