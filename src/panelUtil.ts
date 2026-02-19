export const addresses = process.env.PANEL_ADDRESS!.split(",");

export const MAIN_ADDRESS = addresses[0]!;
export const BASE_PATH = "/panel/api/inbounds";
export const LOGIN_PATH = "/login/";
export const ADD_CLIENT_PATH = "/addClient";
export const GET_INBOUNDS_PATH = "/list";
export const UUID_PATH = "/panel/api/server/getNewUUID";

export const ADMIN_ID = Number(process.env.ADMIN_ID!);

export let authToken: string | null = null;

export const renewCache: Record<number, Config[]> = {};

/**
 *
 * @returns 24 hours from now, in Unix time
 */
export function unix24Hours() {
  const now = Date.now();
  return now + 24 * 60 * 60 * 1000;
}

/**
 *
 * @returns 30 days from now, in Unix time
 */
export function unix30Days() {
  const now = Date.now();
  return now + 24 * 30 * 60 * 60 * 1000;
}

/**
 * For some reason, MHSanaei thought it was a good idea to use BYTES as the unit for limiting the total flow.
 * @param gbs How many GigaBytes do you need?
 * @returns The amount of bytes
 */
export function GB(gbs: number) {
  return gbs * 1073741824;
}

/**
 * Function for logging into your panel.
 * Takes the username and password from .env file.
 *
 * @param headers The request headers, compilent to what the panel's API needs.
 * https://documenter.getpostman.com/view/5146551/2sB3QCTuB6
 */
export async function loginToPanel(headers: Headers) {
  console.log("start login...");
  const user: User = {
    username: process.env.PANEL_USERNAME!,
    password: process.env.PANEL_PASSWORD!,
  };
  const req = new Request(`${MAIN_ADDRESS}${LOGIN_PATH}`, {
    method: "POST",
    headers,
    body: JSON.stringify(user),
    credentials: "include",
  });

  const res = await fetch(req);
  const status = await res.json();
  console.log(status);

  // Extract 3x-ui cookie value from Set-Cookie header
  const setCookieHeader = res.headers.get("Set-Cookie");
  if (setCookieHeader?.includes("3x-ui=")) {
    // Extract just the cookie name=value part
    const cookiePart = setCookieHeader.split(";")[0];
    authToken = cookiePart!;
    console.log("Login successful, cookie set");
  }
}

/**
 * Function for generating a complient UUID.
 *
 * Recieves the UUID from the panel itself.
 * @param headers The request headers, compilent to what the panel's API needs.
 * https://documenter.getpostman.com/view/5146551/2sB3QCTuB6
 * @returns A string of generated UUID.
 */
export async function getUUID(headers: Headers) {
  // Add cookie to request if we have it
  if (authToken) {
    headers.set("Cookie", authToken);
  }

  const req = new Request(`${MAIN_ADDRESS}${UUID_PATH}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  const res = await fetch(req);
  const body = (await res.json()) as UUID;
  const uuid = body.obj.uuid;

  return uuid;
}

/**
 * Function to get all inbounds
 * @param headers The request headers, compilent to what the panel's API needs.
 * https://documenter.getpostman.com/view/5146551/2sB3QCTuB6
 * @returns A ListResponse object with all inbounds data.
 */
export async function getInbounds(headers: Headers) {
  console.log("start getInbounds");

  // Login if needed
  if (authToken) {
    headers.set("Cookie", authToken);
  }

  const req = new Request(`${MAIN_ADDRESS}${BASE_PATH}${GET_INBOUNDS_PATH}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  const res = await fetch(req);

  const js = (await res.json()) as Omit<ListResp, "obj"> & {
    obj: (Omit<Obj, "settings" | "streamSettings"> & {
      settings: string;
      streamSettings: string;
    })[];
  };

  // Parse settings JSON strings to objects
  const parsed: ListResp = {
    ...js,
    obj: js.obj.map((obj) => ({
      ...obj,
      settings: JSON.parse(obj.settings) as Settings,
      streamSettings: JSON.parse(obj.streamSettings) as StreamSettings,
    })),
  };

  return parsed;
}

/**
 * Function that frankensteins the data to get to the config URL; 'cause for some reson, MHSanaei thought noone needed config URL.
 *
 * @param tgID Telegram User ID of the user you want to generate config URL for.
 * @param inbounds The object reveived from getInbounds function.
 * @returns The v2ray config URL for the user.
 */
export async function generateConfigURL(tgID: number, inbounds: ListResp) {
  for (let obj of inbounds.obj) {
    for (let client of obj.settings.clients) {
      if (tgID === client.tgId) {
        return `${obj.protocol}://${client.id}@${new URL(MAIN_ADDRESS).hostname}:${obj.port}?type=${obj.streamSettings.network}&encryption=${obj.settings.encryption || "none"}&security=${obj.streamSettings.security}#${obj.remark}-${client.email}`;
      }
    }
  }
}

export async function userHasAccount(tgID: number) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  // Login if needed
  if (!authToken) {
    await loginToPanel(headers);
  }

  let configs: Config[] = [];
  const inbounds = await getInbounds(headers);

  inbounds.obj.forEach((obj) => {
    obj.settings.clients.forEach((client, idx) => {
      if (tgID === Number(client.comment)) {
        configs.push({
          email: `${obj.clientStats[idx]?.enable ? "🟢" : "🛑"} ${client.email}`,
          status: obj.clientStats[idx]?.enable!,
        });
      }
    });
  });

  console.log(configs);

  return configs;
}
