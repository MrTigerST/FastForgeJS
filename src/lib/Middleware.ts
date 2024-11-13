namespace Middleware {
    export function Lock(route: string, msg: any) {
        return (req: any, res: any) => {
            if(req.originalUrl === route){
                if (typeof(msg) == "string") {
                    return res.status(403).send("The Route is locked.");
                } else if(typeof(msg) == "object") {
                    return res.status(403).json({message: "The Route is locked."});
                } else {
                    return res.status(403).send("The Route is locked.");
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