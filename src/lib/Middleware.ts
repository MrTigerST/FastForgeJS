namespace Middleware {
    export function lockMiddleware(route: string) {
        return (req: any, res: any, next: Function) => {

            if (req.originalUrl === route) {
                return res.status(403).json({ message: `Access to the route ${route} is locked.` });
            }

            next();
        };
    }
}

export { Middleware };