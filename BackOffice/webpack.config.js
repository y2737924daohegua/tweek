import { ServerConfig, ClientConfig } from 'react-project/webpack';

const cssLoader = ClientConfig.module.loaders.find(x => x.loader.indexOf('style-loader!') !== -1);
const nodeModulesLoader = { ...cssLoader,
    test: /node_modules.+\.css$/,
    loader: 'style-loader!css-loader!postcss-loader',
};

cssLoader.exclude = /node_modules/;
ClientConfig.module.loaders.push(nodeModulesLoader);

export { ClientConfig, ServerConfig };