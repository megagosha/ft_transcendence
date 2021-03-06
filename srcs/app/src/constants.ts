import {join} from "path";

export const OAuthConstants = {
  clientID: '4d8bdbfc4b56647b57eee634436634f91c17a5cee631f06d1f4c4d3cd83bc9fa',
  clientSecret:
    '646c443f0039887cd1fa055dcbf55a0321d3e21c392baa5e7dce08115458f701',
  callbackURL: 'http://localhost:3000/login/accept',
};

export const jwtConstants = {
  secret: 'secretKey',
  // tmpSecret: 'newSecret',
  twoAuthAppName: 'ft_transcendence',
};

// export const rootPath = '/var/www/app/';

export const renderPath = '/static/';

export const rootPath = join(process.cwd(), "static");
export const chatAvatarsPath = join(rootPath, "files", "chat");
export const userAvatarsPath = join(rootPath, "files", "user");

// export const renderPath = '/static/';
