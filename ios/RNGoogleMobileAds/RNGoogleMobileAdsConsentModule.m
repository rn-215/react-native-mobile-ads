//
/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#import <React/RCTUtils.h>

#import <React/RCTConvert.h>
#include <UserMessagingPlatform/UserMessagingPlatform.h>
#import "RCTBridgeModule.h"
#import "RNGoogleMobileAdsConsentModule.h"
#import "common/RNSharedUtils.h"

@implementation RNGoogleMobileAdsConsentModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

#pragma mark -
#pragma mark Google Mobile Ads Methods

- (NSString *)getConsentStatusString:(UMPConsentStatus)consentStatus {
  switch (consentStatus) {
    case UMPConsentStatusRequired:
      return @"REQUIRED";
    case UMPConsentStatusNotRequired:
      return @"NOT_REQUIRED";
    case UMPConsentStatusObtained:
      return @"OBTAINED";
    case UMPConsentStatusUnknown:
    default:
      return @"UNKNOWN";
  }
}

RCT_EXPORT_METHOD(requestInfoUpdate
                  : (NSDictionary *)options
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  UMPRequestParameters *parameters = [[UMPRequestParameters alloc] init];
  UMPDebugSettings *debugSettings = [[UMPDebugSettings alloc] init];

  debugSettings.geography = [options[@"debugGeography"] integerValue] ?: UMPDebugGeographyDisabled;
  debugSettings.testDeviceIdentifiers =
      [options valueForKeyPath:@"testDeviceIdentifiers"] ?: [[NSMutableArray alloc] init];

  parameters.debugSettings = debugSettings;
  parameters.tagForUnderAgeOfConsent = [options[@"tagForUnderAgeOfConsent"] boolValue] ?: FALSE;

  [UMPConsentInformation.sharedInstance
      requestConsentInfoUpdateWithParameters:parameters
                           completionHandler:^(NSError *_Nullable error) {
                             if (error) {
                               [RNSharedUtils
                                   rejectPromiseWithUserInfo:reject
                                                    userInfo:[@{
                                                      @"code" : @"consent-update-failed",
                                                      @"message" : error.localizedDescription,
                                                    } mutableCopy]];
                             } else {
                               resolve(@{
                                 @"status" : [self
                                     getConsentStatusString:UMPConsentInformation.sharedInstance
                                                                .consentStatus],
                                 @"isConsentFormAvailable" :
                                     @(UMPConsentInformation.sharedInstance.formStatus ==
                                       UMPFormStatusAvailable)
                               });
                             }
                           }];
}

RCT_EXPORT_METHOD(showForm : (RCTPromiseResolveBlock)resolve : (RCTPromiseRejectBlock)reject) {
  [UMPConsentForm loadWithCompletionHandler:^(UMPConsentForm *form, NSError *loadError) {
    if (loadError) {
      [RNSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:[@{
                                        @"code" : @"consent-form-error",
                                        @"message" : loadError.localizedDescription,
                                      } mutableCopy]];
    } else {
      [form
          presentFromViewController:[UIApplication sharedApplication]
                                        .delegate.window.rootViewController
                  completionHandler:^(NSError *_Nullable dismissError) {
                    if (dismissError) {
                      [RNSharedUtils
                          rejectPromiseWithUserInfo:reject
                                           userInfo:[@{
                                             @"code" : @"consent-form-error",
                                             @"message" : dismissError.localizedDescription,
                                           } mutableCopy]];
                    } else {
                      resolve(@{
                        @"status" : [self getConsentStatusString:UMPConsentInformation
                                                                     .sharedInstance.consentStatus],
                      });
                    }
                  }];
    }
  }];
}

RCT_EXPORT_METHOD(reset) { [UMPConsentInformation.sharedInstance reset]; }

@end
