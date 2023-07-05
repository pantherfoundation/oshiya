// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import {create, globSource} from 'ipfs-http-client';

//! Note: this script must be run from the `dapp/` directory directly.
// Load .env file from dapp/.env
dotenv.config({});

// ============================== IPFS ==============================

export function getInfuraAuthHeader(): string {
    const projectId = getEnvVarOrFail<string>(EnvVar.ProjectId);
    const projectSecret = getEnvVarOrFail<string>(EnvVar.ProjectSecret);

    const auth = Buffer.from([projectId, projectSecret].join(':')).toString(
        'base64',
    );

    return `Basic ${auth}`;
}

type HttpProtocol = 'http' | 'https';
type IpfsNodeInfo = {
    host: string;
    protocol: HttpProtocol;
    port: number;
    headers: {[key: string]: string};
};

export function makeInfuraNode(): IpfsNodeInfo {
    return {
        host: 'ipfs.infura.io',
        protocol: 'https',
        port: 5001,
        headers: {
            authorization: getInfuraAuthHeader(),
        },
    };
}

export function makeDefaultLocalIpfs(): IpfsNodeInfo {
    return {
        host: '127.0.0.1',
        protocol: 'http',
        port: 5001,
        headers: {},
    };
}

export function makeCustomIpfsNode(): IpfsNodeInfo {
    const host = getEnvVarOrFail<string>(EnvVar.IfpsHost);
    const protocol = getEnvVarOrFail<HttpProtocol>(EnvVar.IpfsProtocol);
    const port = getEnvVarOrFail<number>(EnvVar.IpfsPort);

    if (protocol != 'http' && protocol !== 'https')
        throw new Error(
            `"${protocol}" is not a valid protocol. Must be http or https`,
        );

    if (Number.isNaN(Number(port)))
        throw new Error(`"${port}" is not valid port. Must be a number`);

    return {
        host,
        protocol,
        port: Number(port),
        headers: {},
    };
}

export function getIpfsNode(
    useInfuraNode: boolean,
    useCustomNode: boolean,
): IpfsNodeInfo {
    if (useInfuraNode) return makeInfuraNode();
    if (useCustomNode) return makeCustomIpfsNode();
    // Default to local ipfs node if no other option
    return makeDefaultLocalIpfs();
}

async function deployToIpfs(
    ipfsNode: IpfsNodeInfo,
): Promise<{indexHtmlCid: string; rootDirCid: string}> {
    const buildDir = 'build';

    if (!fs.existsSync(buildDir))
        throw new Error(
            "Build directory doesn't exist. You need to build first!",
        );

    const ipfs = await create(ipfsNode);

    // Root Directory where all the content of the `build/` dir lives
    let rootDirCid = '';
    const indexHtmlPath = path.join(buildDir, 'index.html');

    for await (const file of ipfs.addAll(globSource(buildDir, '*'), {
        wrapWithDirectory: true,
    })) {
        console.log(`[${file.path || 'ipfs-cid'}]: ${file.cid}`);
        if (!file.path) rootDirCid = file.cid.toString();
    }

    const indexHtml = getIndexHtml(indexHtmlPath, rootDirCid);
    const result = await ipfs.add(indexHtml);
    const indexHtmlCid = result.cid.toString();

    console.log(`#>> Your build is deployed to ${makeIpfsUrl(indexHtmlCid)}`);
    console.log(`#>> Index.html CID: ipfs://${indexHtmlCid}`);
    console.log(`#>> Build Direcoty: ipfs://${rootDirCid}`);

    return {indexHtmlCid, rootDirCid};
}

export function getIndexHtml(indexHtmlPath: string, baseIpfsCid: string) {
    const html = fs.readFileSync(indexHtmlPath).toString();
    const fileToUrl = (file: string, withQuotes = true) => {
        const wrapper = withQuotes ? '"' : '';
        return `${wrapper}https://ipfs.io/ipfs/${baseIpfsCid}/${file}${wrapper}`;
    };

    const filesToReplace = ['main.js', 'vendor-react.js', 'logo.png'];

    let updatedHtml = filesToReplace.reduce((acc, curr) => {
        return acc.replace(`"${curr}"`, fileToUrl(curr));
    }, html);

    // map `%PUBLIC_URL%/logo.png` -> `<IPFS_LINK>/logo.png`
    updatedHtml = updatedHtml.replace(
        '"%PUBLIC_URL%/logo.png"',
        fileToUrl('logo.png'),
    );

    // map `/manifest.<RANDOM_HASH>` -> `<IPFS_LINK>/manifest.<HASH>`
    updatedHtml = updatedHtml.replace(
        '/manifest.',
        fileToUrl('manifest.', false),
    );

    return updatedHtml;
}

// ============================== Utils ==============================
export function makeIpfsUrl(ipfsCid: string): string {
    return `https://ipfs.io/ipfs/${ipfsCid}/`;
}

export function getFlag(flag: string): boolean {
    return process.argv.includes(flag);
}

export enum EnvVar {
    ProjectId = 'INFURA_PROJECT_ID',
    ProjectSecret = 'INFURA_PROJECT_SECRET_ID',
    IfpsHost = 'IPFS_HOST',
    IpfsPort = 'IPFS_PORT',
    IpfsProtocol = 'IPFS_PROTOCOL',
}

export function getEnvVarOrFail<T = string>(envVar: EnvVar): T {
    const value = process.env[envVar];
    if (!value) throw new Error(`Missing '${envVar}' environment variable`);
    return value as T;
}

// ============================== Entry Point  ==============================
async function main() {
    const withInfuraNode = getFlag('--infura');
    const withCustomNode = getFlag('--custom');
    const withDefaultLocalNode = getFlag('--local-default');

    let ipfsNode: IpfsNodeInfo | null = null;
    if (withDefaultLocalNode) ipfsNode = makeDefaultLocalIpfs();
    if (withInfuraNode) ipfsNode = makeInfuraNode();
    if (withCustomNode) ipfsNode = makeCustomIpfsNode();
    if (ipfsNode !== null) return await deployToIpfs(ipfsNode);

    throw new Error('No flag provided Or Invalid Flag. Please read the docs');
}

const isScriptRunDirectly = process.argv.includes(__filename);
if (isScriptRunDirectly) {
    main()
        .then(() => process.exit(0))
        .catch(err => {
            console.log(err);
            process.exit(1);
        });
}
