import {isMessageOf} from 'utils/sw-utils';

export type TabId = number;

export enum SwMessage {
    Connect = 'connect',
    Disconnect = 'disconnect',
    Ready = 'ready',
    CountUpdated = 'count/updated',
    Stop = 'count/stop',
    UpdateCount = 'count/update',
}

export class SwManager {
    private messageChannel: MessageChannel;
    private readonly tabId: TabId;

    constructor() {
        this.messageChannel = new MessageChannel();
        this.tabId = Math.floor(Math.random() * 1_000_000);
    }

    async init(): Promise<void> {
        const sw = await this.getServiceWorker();
        const tabId = this.tabId;

        sw.postMessage(
            {
                type: SwMessage.Connect,
                tabId,
            },
            [this.messageChannel.port2],
        );

        // Disconnect from the service worker
        window.onbeforeunload = function () {
            sw.postMessage({
                type: SwMessage.Disconnect,
                tabId,
            });
            return '';
        };

        return new Promise(resolve => {
            this.handleMessage(async (event: MessageEvent) => {
                if (isMessageOf(SwMessage.Ready, event.data)) return resolve();
            });
        });
    }

    public handleMessage(
        callback: <T>(event: MessageEvent<T>) => Promise<void>,
    ): void {
        this.messageChannel.port1.onmessage = callback;
    }

    public async sendMessage<T extends {type: SwMessage}>(message: T) {
        const sw = await this.getServiceWorker();
        sw.postMessage(message);
    }

    public async getServiceWorker() {
        if (!navigator.serviceWorker)
            throw new Error('Browser does not support service workers');

        const reg = await navigator.serviceWorker.register('miner-sw.js', {
            scope: './',
        });

        if (reg.active === null)
            throw new Error('Service worker is not active!');

        return reg.active;
    }
}

export const swManager = new SwManager();
