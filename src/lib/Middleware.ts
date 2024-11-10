const express = require('express');

namespace Middleware {
    export function lock(route: string, msg: string) {
        return (req: any, res: any, next: Function) => {
            if (req.originalUrl === route) {
                return res.status(403).json({ message: msg || `This route is locked.` });
            }

            next();
        };
    }
}

export { Middleware };