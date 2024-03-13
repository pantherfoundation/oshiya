// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

export function log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: ${message}`);
}

export type LogFn = (message: string) => void;
