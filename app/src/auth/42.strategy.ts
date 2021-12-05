import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpService, HttpModule, Logger } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { AuthService } from './auth.service';
import { stringify } from 'querystring';
import { OAuthConstants } from './constants';

// @todo import from file
const clientID =
  '4d8bdbfc4b56647b57eee634436634f91c17a5cee631f06d1f4c4d3cd83bc9fa';
const clientSecret =
  '646c443f0039887cd1fa055dcbf55a0321d3e21c392baa5e7dce08115458f701';
const callbackURL = 'http://localhost:3000/auth/fortytwo';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'fortytwo') {
  constructor(private authService: AuthService, private http: HttpService) {
    super({
      authorizationURL: `https://api.intra.42.fr/oauth/authorize?${stringify({
        client_id: OAuthConstants.clientID,
        redirect_uri: callbackURL,
        response_type: 'code',
        scope: 'public',
      })}`,
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      scope: 'public',
      clientID,
      clientSecret,
      callbackURL,
    });
  }
  async validate(accessToken: string): Promise<any> {
    const { data } = await this.http
      .get('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .toPromise();
    new Logger().log(data);
    return this.authService.findUserFrom42Id(data.id);
  }
}
