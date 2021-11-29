import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthWellKnownService } from '../../config/auth-well-known/auth-well-known.service';
import { AuthWellKnownServiceMock } from '../../config/auth-well-known/auth-well-known.service-mock';
import { LoggerService } from '../../logging/logger.service';
import { LoggerServiceMock } from '../../logging/logger.service-mock';
import { RedirectService } from '../../utils/redirect/redirect.service';
import { RedirectServiceMock } from '../../utils/redirect/redirect.service-mock';
import { UrlService } from '../../utils/url/url.service';
import { UrlServiceMock } from '../../utils/url/url.service-mock';
import { ResponseTypeValidationService } from '../response-type-validation/response-type-validation.service';
import { ResponseTypeValidationServiceMock } from '../response-type-validation/response-type-validation.service.mock';
import { StandardLoginService } from './standard-login.service';

describe('StandardLoginService', () => {
  let standardLoginService: StandardLoginService;
  let loggerService: LoggerService;
  let responseTypeValidationService: ResponseTypeValidationService;
  let urlService: UrlService;
  let redirectService: RedirectService;
  let authWellKnownService: AuthWellKnownService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        StandardLoginService,
        { provide: LoggerService, useClass: LoggerServiceMock },
        { provide: ResponseTypeValidationService, useClass: ResponseTypeValidationServiceMock },
        { provide: UrlService, useClass: UrlServiceMock },
        { provide: RedirectService, useClass: RedirectServiceMock },
        { provide: AuthWellKnownService, useClass: AuthWellKnownServiceMock },
      ],
    });
  });

  beforeEach(() => {
    standardLoginService = TestBed.inject(StandardLoginService);
    loggerService = TestBed.inject(LoggerService);
    responseTypeValidationService = TestBed.inject(ResponseTypeValidationService);
    standardLoginService = TestBed.inject(StandardLoginService);
    urlService = TestBed.inject(UrlService);
    redirectService = TestBed.inject(RedirectService);
    authWellKnownService = TestBed.inject(AuthWellKnownService);
  });

  it('should create', () => {
    expect(standardLoginService).toBeTruthy();
  });

  describe('login', () => {
    it(
      'does nothing if it has an invalid response type',
      waitForAsync(() => {
        spyOn(responseTypeValidationService, 'hasConfigValidResponseType').and.returnValue(false);
        const loggerSpy = spyOn(loggerService, 'logError');

        const result = standardLoginService.loginStandard({ configId: 'configId1' });

        expect(result).toBeUndefined();
        expect(loggerSpy).toHaveBeenCalled();
      })
    );

    it(
      'does nothing if no well known endpoint is given',
      waitForAsync(() => {
        const config = { responseType: 'stubValue' };
        const spy = spyOn(responseTypeValidationService, 'hasConfigValidResponseType').and.returnValue(true);

        const result = standardLoginService.loginStandard(config);

        expect(result).toBeUndefined();
        expect(spy).toHaveBeenCalled();
      })
    );

    it(
      'calls urlService.getAuthorizeUrl() if everything fits',
      waitForAsync(() => {
        const config = {
          authWellknownEndpointUrl: 'authWellknownEndpoint',
          responseType: 'stubValue',
        };
        spyOn(responseTypeValidationService, 'hasConfigValidResponseType').and.returnValue(true);
        spyOn(authWellKnownService, 'queryAndStoreAuthWellKnownEndPoints').and.returnValue(of({}));
        const spy = spyOn(urlService, 'getAuthorizeUrl');

        const result = standardLoginService.loginStandard(config);

        expect(result).toBeUndefined();
        expect(spy).toHaveBeenCalled();
      })
    );

    it(
      'redirects to URL with no URL handler',
      waitForAsync(() => {
        const config = {
          authWellknownEndpointUrl: 'authWellknownEndpoint',
          responseType: 'stubValue',
        };
        spyOn(responseTypeValidationService, 'hasConfigValidResponseType').and.returnValue(true);
        spyOn(authWellKnownService, 'queryAndStoreAuthWellKnownEndPoints').and.returnValue(of({}));
        spyOn(urlService, 'getAuthorizeUrl').and.returnValue('someUrl');
        const redirectSpy = spyOn(redirectService, 'redirectTo').and.callFake(() => {});

        const result = standardLoginService.loginStandard({ configId: 'configId1' });

        expect(result).toBeUndefined();
        expect(redirectSpy).toHaveBeenCalledWith('someUrl');
      })
    );

    it(
      'redirects to URL with URL handler when urlHandler is given',
      waitForAsync(() => {
        const config = {
          authWellknownEndpointUrl: 'authWellknownEndpoint',
          responseType: 'stubValue',
        };
        spyOn(responseTypeValidationService, 'hasConfigValidResponseType').and.returnValue(true);
        spyOn(authWellKnownService, 'queryAndStoreAuthWellKnownEndPoints').and.returnValue(of({}));
        spyOn(urlService, 'getAuthorizeUrl').and.returnValue('someUrl');
        const redirectSpy = spyOn(redirectService, 'redirectTo').and.callFake(() => {});
        const spy = jasmine.createSpy();
        const urlHandler = (url) => {
          spy(url);
        };
        const result = standardLoginService.loginStandard({ configId: 'configId1' }, { urlHandler });
        expect(result).toBeUndefined();
        expect(spy).toHaveBeenCalledWith('someUrl');
        expect(redirectSpy).not.toHaveBeenCalled();
      })
    );

    it(
      'calls getAuthorizeUrl with custom params if they are given as parameter',
      waitForAsync(() => {
        const config = {
          authWellknownEndpointUrl: 'authWellknownEndpoint',
          responseType: 'stubValue',
        };
        spyOn(responseTypeValidationService, 'hasConfigValidResponseType').and.returnValue(true);
        spyOn(authWellKnownService, 'queryAndStoreAuthWellKnownEndPoints').and.returnValue(of({}));
        const getAuthorizeUrlSpy = spyOn(urlService, 'getAuthorizeUrl').and.returnValue('someUrl');
        const redirectSpy = spyOn(redirectService, 'redirectTo').and.callFake(() => {});
        const result = standardLoginService.loginStandard({ configId: 'configId1' }, { customParams: { to: 'add', as: 'well' } });
        expect(result).toBeUndefined();
        expect(redirectSpy).toHaveBeenCalledWith('someUrl');
        expect(getAuthorizeUrlSpy).toHaveBeenCalledWith({ configId: 'configId1' }, { to: 'add', as: 'well' });
      })
    );
  });
});
