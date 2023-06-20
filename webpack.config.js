module.exports = {
    // ... other webpack config settings
  
    module: {
      rules: [
        // ... other rules
  
        // Rule for handling glTF files
        {
          test: /\.(gltf|glb)$/,
          use: [
            {
              loader: 'gltf-webpack-loader'
            }
          ]
        }
      ]
    }
  };
  