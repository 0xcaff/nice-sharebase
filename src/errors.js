import { GraphQLError } from 'graphql';

// An error which occurs when making a request fails.
export class FetchError extends GraphQLError {
  constructor(resp, body) {
    super(`Request Failed. Status: ${resp.status} - ${resp.statusText}. Body: ${body}`);

    this.body = body;
    this.resp = resp;
  }
}

export const throwOnFail = async (resp) => {
  if (resp.ok) {
    return resp;
  } else {
    throw new FetchError(resp, await resp.text());
  }
}