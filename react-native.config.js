module.exports = {
  dependencies: {
    // ONNX 1.24.3 ships unimodule.json but registers a regular ReactPackage.
    'onnxruntime-react-native': {
      platforms: {
        android: {
          packageImportPath:
            'import ai.onnxruntime.reactnative.OnnxruntimePackage;',
          packageInstance: 'new OnnxruntimePackage()',
        },
      },
    },
  },
};
