namespace Middleware {
    export function Lock(route: string, msg: any) {
        return (res: any, req: any) => {
            if (req.originalUrl === route) {
                if (typeof(msg) == "string") {
                    return res.status(403).send(msg ?? "The Route is locked.");
                } else if(typeof(msg) == "object") {
                    return res.status(403).json(msg ?? {message: "The Route is locked."});
                }
            }
        };
    }
    
    export function Redirect(url: string) {
        return (res: any) => {
            res.redirect(url);
        };
    }
}

export { Middleware };