import {parseEnvVariables, requiredVars} from '../src/env';

const base = {
    INTERVAL: '10',
    PRIVATE_KEY: 'test-only',
    RPC_URL: 'https://example.test',
    CONTRACT_ADDRESS: 'test-contract',
    SUBGRAPH_URL: 'https://example.test/projection',
    GENESIS_BLOCK_NUMBER: '10',
    MIN_REWARD: '0.1',
    PROTOCOL_VERSION: 'production',
};

describe('optional subgraph configuration', () => {
    it('preserves public endpoint configuration without credentials', () => {
        expect(parseEnvVariables(base)).toMatchObject({
            SUBGRAPH_URL: base.SUBGRAPH_URL,
        });
        expect(parseEnvVariables(base).SUBGRAPH_AUTH_TOKEN).toBeUndefined();
    });

    it('parses an optional token and page size without adding the token to logged settings', () => {
        expect(
            parseEnvVariables({
                ...base,
                SUBGRAPH_AUTH_TOKEN: 'test-token',
                PAGE_SIZE: '100',
            }),
        ).toMatchObject({SUBGRAPH_AUTH_TOKEN: 'test-token', PAGE_SIZE: 100});
        expect(requiredVars).not.toContain('SUBGRAPH_AUTH_TOKEN');
    });

    it.each(['0', '-1', 'NaN', 'Infinity', '1.5', '100junk'])(
        'rejects invalid page size %s',
        value => {
            expect(() =>
                parseEnvVariables({...base, PAGE_SIZE: value}),
            ).toThrow('PAGE_SIZE must be a positive integer');
        },
    );
});
