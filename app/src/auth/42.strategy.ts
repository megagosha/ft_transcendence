import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { AuthService } from './auth.service';
import { stringify } from 'querystring';
// @todo import from file
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackURL = process.env.CALLBACK_URL;

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'fortytwo') {
  constructor(private authService: AuthService, private http: HttpService) {
    super({
      authorizationURL: `https://api.intra.42.fr/oauth/authorize?${stringify({
        client_id: clientID,
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
    if (!data || !data.id) {
      throw new UnauthorizedException();
    }
    return {
      id: data.id,
      email: data.email,
      login: data.login,
      username: data.login,
      image_url: data.image_url,
    };
  }
}
