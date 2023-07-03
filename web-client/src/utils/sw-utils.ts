import {SwMessage} from 'services/sw-manager';

export function isMessageOf<T>(
    type: SwMessage,
    data: any,
): data is T & {type: SwMessage} {
    return data && data.type === type;
}
