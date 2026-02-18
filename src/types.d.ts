interface Config {
  email: string;
  status: boolean;
}

interface User {
  username: string;
  password: string;
}

interface UUID {
  success?: string;
  msg?: string;
  obj: {
    uuid: string;
  };
}

interface AddClientBody {
  id: number;
  settings: string;
}

interface ListResp {
  success: boolean;
  msg: string;
  obj: Obj[];
}

interface Obj {
  id: number;
  up: number;
  down: number;
  total: number;
  allTime: number;
  remark: string;
  enable: boolean;
  expiryTime: number;
  trafficReset: string;
  lastTrafficResetTime: number;
  clientStats: ClientStat[];
  listen: string;
  port: number;
  protocol: string;
  settings: Settings;
  streamSettings: StreamSettings;
  tag: string;
  sniffing: string;
}

interface ClientStat {
  id: number;
  inboundId: number;
  enable: boolean;
  email: string;
  uuid: string;
  subId: string;
  up: number;
  down: number;
  allTime: number;
  expiryTime: number;
  total: number;
  reset: number;
  lastOnline: number;
}

interface Client {
  comment: string;
  created_at: number;
  email: string;
  enable: boolean;
  expiryTime: number;
  flow: string;
  id: string;
  limitIp: number;
  reset: number;
  subId: string;
  tgId: number | string;
  totalGB: number;
  updated_at: number;
  password?: string;
  security?: string;
}

interface Settings {
  clients: Client[];
  decryption?: string;
  encryption?: string;
  testseed?: number[];
}

interface StreamSettings {
  network: string;
  security: string;
  externalProxy: any[];
  tcpSettings: {
    acceptProxyProtocol: boolean;
    header: {
      type: string;
    };
  };
}
