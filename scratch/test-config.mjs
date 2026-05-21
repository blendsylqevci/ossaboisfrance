import nextConfig from '../next.config.mjs';
console.log(JSON.stringify(nextConfig, (key, val) => {
  if (typeof val === 'function') {
    return val.toString();
  }
  return val;
}, 2));
