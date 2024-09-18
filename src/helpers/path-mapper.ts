import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// __dirname equivalent for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


/**
 * PathMapper class to resolve paths with aliases
 * 
 * @class PathMapper
 */
export class PathMapper {
    private static aliases: { [key: string]: string } = {
        '@root': path.resolve(__dirname, '../../'),
        '@src': path.resolve(__dirname, '../../src'),
        '@logs': path.resolve(__dirname, '../../logs'),
    };

    private static formatPath(pathStr: string): string {
        const paths = pathStr.split('/').filter(p => p != '');
        return paths.join('/');
    }

    public static resolve(pathStr: string): string {
        const pathFormatted = this.formatPath(pathStr);

        let matchAlias = false;

        for (const alias in this.aliases) {
            if (pathStr.startsWith(alias)) {
                const paths = pathStr.split('/');
                const aliasPath = paths[0];

                if (aliasPath === alias) {
                    pathStr = pathFormatted.replace(alias, this.aliases[alias]);
                    matchAlias = true;
                    break;
                }
            }
        }
        
        return matchAlias ? pathStr : path.resolve(this.aliases['@src'], pathFormatted);
    }
}