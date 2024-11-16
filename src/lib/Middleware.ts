namespace Middleware {
    /**
     * Lock a route.
     * @param route Route to lock.
     * @param msg  Message the user will receive when trying to access this route (optional).
    */
    export function Lock(route: string, msg?: any) {
        return (req: any, res: any) => {
            if(req.originalUrl === route){
                if (typeof(msg) == "string") {
                    return res.status(403).send(msg ?? "The Route is locked.");
                } else if(typeof(msg) == "object") {
                    return res.status(403).json(msg ?? {message: "The Route is locked."});
                } else {
                    return res.status(403).send("The Route is locked.");
                }
            }
        };
    }

    /**
     * Redirects the user to a URL.
     * @param url The URL where the user should be redirected.
    */
    export function Redirect(url: string) {
        return (res: any) => {
            res.redirect(url);
        };
    }
}

export { Middleware };