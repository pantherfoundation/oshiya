import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {SwMessage, TabId} from './sw-manager';

const messagePorts: Map<TabId, MessagePort> = new Map();

self.addEventListener('message', event => {
    // Connect
    if (isMessageOf<{tabId: TabId}>(SwMessage.Connect, event.data)) {
        const tabId = event.data.tabId;
        const port = event.ports[0];
        messagePorts.set(tabId, port);
        port.postMessage({type: SwMessage.Ready});

        console.log(`[ServiceWorker] Connected to ${tabId}`);
    }

    // Disconnect
    if (isMessageOf<{tabId: TabId}>(SwMessage.Disconnect, event.data)) {
        const tabId = event.data.tabId as number;
        console.log(`[ServiceWorker] Disconnected from ${tabId}`);
        messagePorts.delete(tabId);
        console.log({messagePorts});
    }
});

self.addEventListener('activate', () => {
    console.log('SW activated!!');
});

function isMessageOf<T>(
    type: SwMessage,
    data: any,
): data is T & {type: SwMessage} {
    return data && data.type === type;
}
