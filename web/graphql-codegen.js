/** @type {import('@graphql-codegen/cli').CodegenConfig} */
const config = {
  overwrite: true,
  generates: {
    ['stores/graphql/generated.ts']: {
      schema: process.argv[4],
      documents: ['**/*.graphql'],
      plugins: ['typescript', 'typescript-operations', 'typescript-generic-sdk'],
      config: {
        defaultScalarType: 'string',
        enumsAsTypes: true,
        scalars: {
          Upload: 'File',
        },
      },
    },
  },
}

module.exports = config
