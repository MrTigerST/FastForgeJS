namespace RouteTools {
  export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

  export interface EndpointDefinition {
    method: HttpMethod;
    handler: (req: any, res: any) => void;
  }

  export function createEndpoint(method: HttpMethod, handler: (req: any, res: any) => void): EndpointDefinition {
    return { method, handler };
  }
}

export { RouteTools };