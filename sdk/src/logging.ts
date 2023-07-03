// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

export function log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: ${message}`);
}
