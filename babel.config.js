const { NODE_ENV } = process.env

module.exports = {
  presets: ['@babel/preset-env'],
  plugins: (NODE_ENV === 'test') ? ['@babel/plugin-transform-runtime'] : []
}
