/*
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

import { isFunction, isString } from '../common';
import { MobileAds } from '../MobileAds';
import { validateAdRequestOptions } from '../validateAdRequestOptions';
import { validateAdShowOptions } from '../validateAdShowOptions';
import { MobileAd } from './MobileAd';
import { AdEventListener } from '../types/AdEventListener';
import { AdShowOptions } from '../types/AdShowOptions';
import { RequestOptions } from '../types/RequestOptions';
import { MobileAdInterface } from '../types/MobileAd.interface';

let _rewardedRequest = 0;

/**
 * A class for interacting and showing Rewarded Ads.
 *
 * An Rewarded advert can be pre-loaded and shown at a suitable point in your apps flow, such as at the end of a level
 * in a game. The content of a rewarded advert can be controlled via your Google Mobile Ads dashboard. Typically users are rewarded
 * after completing a specific advert action (e.g. watching a video or submitting an option via an interactive form).
 * Events (such as the user earning a reward or closing a rewarded advert early) are sent back for you to handle accordingly
 * within your application.
 *
 * #### Example
 *
 * First create a new Rewarded instance, passing in your Ad Unit ID from the Google Mobile Ads configuration console, and any additional
 * request options. The example below will present a test advert, and only request a non-personalized ad.
 *
 * ```js
 * import { RewardedAd, TestIds } from 'react-native-google-mobile-ads';
 *
 * const rewarded = RewardedAd.createForAdRequest(TestIds.REWARDED, {
 *     requestNonPersonalizedAdsOnly: true,
 * });
 *  ```
 *
 * Each advert needs to be loaded from Google Mobile Ads before being shown. It is recommended this is performed before the user
 * reaches the checkpoint to show the advert, so it's ready to go. Before loading the advert, we need to setup
 * event listeners to listen for updates from Google Mobile Ads, such as advert loaded or failed to load.
 *
 * Event types match the `AdEventType` or `RewardedAdEventType` interface. The potential user reward for rewarded
 * adverts are passed back to the event handler on advert load and when the user earns the reward.
 *
 * ```js
 * import { RewardedAdEventType } from 'react-native-google-mobile-ads';
 *
 * rewarded.onAdEvent((type, error, reward) => {
 *   if (type === RewardedAdEventType.LOADED) {
 *     rewarded.show();
 *   }
 *   if (type === RewardedAdEventType.EARNED_REWARD) {
 *     console.log('User earned reward of ', reward);
 *   }
 * });
 *
 * rewarded.load();
 *  ```
 *
 * The rewarded advert will be presented to the user, and several more events can be triggered such as the user clicking the
 * advert, closing it or completing the action.
 */
export class RewardedAd extends MobileAd implements MobileAdInterface {
  /**
   * Creates a new RewardedAd instance.
   *
   * #### Example
   *
   * ```js
   * import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
   *
   * const rewardedAd = await RewardedAd.request(TestIds.REWARDED, {
   *   requestAgent: 'CoolAds',
   * });
   *
   * rewardedAd.onAdEvent((type, error, data) => {
   *   console.log('New event: ', type, error);
   *
   *   if (type === RewardedAdEventType.LOADED) {
   *     rewardedAd.show();
   *   }
   * });
   *
   * rewardedAd.load();
   * ```
   *
   * @param adUnitId The Ad Unit ID for the Rewarded Ad. You can find this on your Google Mobile Ads dashboard.
   * @param requestOptions Optional RequestOptions used to load the ad.
   */
  static createForAdRequest(adUnitId: string, requestOptions?: RequestOptions): RewardedAd {
    if (!isString(adUnitId)) {
      throw new Error("RewardedAd.createForAdRequest(*) 'adUnitId' expected an string value.");
    }

    let options = {};
    try {
      options = validateAdRequestOptions(requestOptions);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`RewardedAd.createForAdRequest(_, *) ${e.message}.`);
      }
    }

    const requestId = _rewardedRequest++;
    return new RewardedAd('rewarded', MobileAds(), requestId, adUnitId, options);
  }

  load() {
    // Prevent multiple load calls
    if (this._loaded || this._isLoadCalled) {
      return;
    }

    this._isLoadCalled = true;
    this._googleMobileAds.native.rewardedLoad(
      this._requestId,
      this._adUnitId,
      this._requestOptions,
    );
  }

  onAdEvent(handler: AdEventListener) {
    if (!isFunction(handler)) {
      throw new Error("RewardedAd.onAdEvent(*) 'handler' expected a function.");
    }

    return this._setAdEventHandler(handler);
  }

  show(showOptions?: AdShowOptions) {
    if (!this._loaded) {
      throw new Error(
        'RewardedAd.show() The requested RewardedAd has not loaded and could not be shown.',
      );
    }

    let options;
    try {
      options = validateAdShowOptions(showOptions);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`RewardedAd.show(*) ${e.message}.`);
      }
    }
    return this._googleMobileAds.native.rewardedShow(this._requestId, this._adUnitId, options);
  }
}
