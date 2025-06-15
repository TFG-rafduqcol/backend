module.exports = {
    testTimeout: 10000,
    collectCoverage: true,
    coverageDirectory: '../coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    collectCoverageFrom: [
        '../controllers/**/*.js',
        '../models/**/*.js',
        '../routes/**/*.js',
        '../middlewares/**/*.js',
        '!../**/index.js'
    ]
};
