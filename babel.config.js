// babel.config.js
module.exports = {
  presets: [
    
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', { regenerator: true }],
    'istanbul',
    '@babel/plugin-syntax-import-attributes'
  ]
};
